// Куда ходит HTTP-клиент:
// - в браузере — на сам сайт: /api/* проксирует next.config.ts (rewrites).
//   Так cookie входа «своя» для сайта, даже если API на другом домене
//   (Vercel + Railway);
// - на сервере Next — прямо в API по BACKEND_URL (cookie пересылает shared/session).
export const API_URL =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL ?? "http://localhost:4000")
    : "";

// WebSocket Vercel не проксирует — сокет подключается прямо к API.
export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000";
