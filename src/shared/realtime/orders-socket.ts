import { io, type Socket } from "socket.io-client";

import { http } from "@/shared/api";
import { SOCKET_URL } from "@/shared/config";

// Одно подключение к /orders на всю вкладку: компоненты берут его и отдают
// обратно, последний закрывает.
let socket: Socket | null = null;
let holders = 0;

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

export function acquireOrdersSocket(): Socket {
  socket ??= io(`${SOCKET_URL}/orders`, {
    transports: ["websocket"],
    auth: (callback) => void socketAuth(callback),
  });
  holders += 1;
  return socket;
}

export function releaseOrdersSocket(): void {
  holders = Math.max(0, holders - 1);
  if (holders === 0 && socket) {
    socket.disconnect();
    socket = null;
  }
}
