// Адрес API без /api: пути вида /api/menu приходят из схемы OpenAPI.
// Значение по умолчанию — локальный бэкенд из cofelier-backend.
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
