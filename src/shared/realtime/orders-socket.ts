import { io, type Socket } from "socket.io-client";

import { API_URL } from "@/shared/config";

// Одно подключение к /orders на всю вкладку: компоненты берут его и отдают
// обратно, последний закрывает. Авторизация — httpOnly-cookie (withCredentials).
let socket: Socket | null = null;
let holders = 0;

export function acquireOrdersSocket(): Socket {
  socket ??= io(`${API_URL}/orders`, {
    withCredentials: true,
    transports: ["websocket"],
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
