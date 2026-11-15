import { io, type Socket } from "socket.io-client";

import { http } from "@/shared/api";
import { SOCKET_URL } from "@/shared/config";

// Одно подключение к /orders на всю вкладку: компоненты берут его и отдают
// обратно, последний закрывает.
let socket: Socket | null = null;
let holders = 0;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let retryDelay = 0;
let stableTimer: ReturnType<typeof setTimeout> | undefined;

const RETRY_MIN_MS = 2_000;
const RETRY_MAX_MS = 30_000;
// Сервер сначала принимает подключение и лишь потом проверяет токен, поэтому
// «connect» ещё не успех: паузу сбрасываем, только если связь продержалась.
const STABLE_MS = 5_000;

// Cookie сайта до API на другом домене не доходит: перед каждым подключением
// (и переподключением) берём через прокси сайта токен на минуту.
async function socketAuth(callback: (data: { token?: string }) => void) {
  try {
    const { data } = await http.GET("/api/auth/socket-token");
    callback({ token: data?.token });
  } catch {
    callback({});
  }
}

// Сразу подключиться заново, если сокет нужен и сейчас без связи.
function reconnectNow() {
  if (!socket || socket.connected || holders === 0) return;
  clearTimeout(retryTimer);
  retryTimer = undefined;
  socket.connect();
}

// Отказ сервера («io server disconnect»: токен не успел обновиться, сессия
// истекла) socket.io сам не переподключает — без этого индикатор навсегда
// оставался бы «Нет связи». Пробуем снова с растущей паузой.
function scheduleRetry() {
  clearTimeout(retryTimer);
  retryDelay = Math.min(
    retryDelay ? retryDelay * 2 : RETRY_MIN_MS,
    RETRY_MAX_MS,
  );
  retryTimer = setTimeout(reconnectNow, retryDelay);
}

function handleDisconnect(reason: Socket.DisconnectReason) {
  clearTimeout(stableTimer);
  if (reason === "io server disconnect") scheduleRetry();
}

function handleConnect() {
  clearTimeout(retryTimer);
  retryTimer = undefined;
  clearTimeout(stableTimer);
  stableTimer = setTimeout(() => {
    retryDelay = 0;
  }, STABLE_MS);
}

// Вкладку вернули или сеть появилась — не ждём паузы между попытками.
function handleVisibility() {
  if (document.visibilityState === "visible") reconnectNow();
}

export function acquireOrdersSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/orders`, {
      transports: ["websocket"],
      auth: (callback) => void socketAuth(callback),
    });
    socket.on("disconnect", handleDisconnect);
    socket.on("connect", handleConnect);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", reconnectNow);
  }
  holders += 1;
  return socket;
}

export function releaseOrdersSocket(): void {
  holders = Math.max(0, holders - 1);
  if (holders === 0 && socket) {
    clearTimeout(retryTimer);
    clearTimeout(stableTimer);
    retryTimer = undefined;
    retryDelay = 0;
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("online", reconnectNow);
    socket.off("disconnect", handleDisconnect);
    socket.off("connect", handleConnect);
    socket.disconnect();
    socket = null;
  }
}
