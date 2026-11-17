import createClient from "openapi-fetch";

import { API_URL } from "@/shared/config";

import type { components, paths } from "./schema.gen";

// Единственный HTTP-клиент: пути и типы берутся из схемы бэкенда.
// credentials — чтобы браузер отправлял httpOnly-cookie с JWT (этап 3).
export const http = createClient<paths>({
  baseUrl: API_URL,
  credentials: "include",
});

export type ApiSchemas = components["schemas"];

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    // Для 429: через сколько секунд можно повторить (заголовок Retry-After).
    readonly retryAfterSeconds: number | null = null,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiResult<T> = { data?: T; error?: unknown; response: Response };

// Ответ без ошибки → данные; иначе ApiError с текстом бэкенда (он на русском).
export function unwrap<T>({ data, error, response }: ApiResult<T>): T {
  if (response.ok && data !== undefined) return data;
  throw toApiError(error, response);
}

// Для ответов без тела (204 на DELETE): только проверка, что запрос удался.
export function ensureOk({ error, response }: ApiResult<unknown>): void {
  if (!response.ok) throw toApiError(error, response);
}

function toApiError(error: unknown, response: Response): ApiError {
  const retryAfter = Number(response.headers.get("Retry-After"));
  return new ApiError(
    readErrorMessage(error, response.status),
    response.status,
    Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
  );
}

// Nest отдаёт message строкой, а ошибки валидации DTO — массивом строк.
function readErrorMessage(error: unknown, status: number): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const { message } = error;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && typeof message[0] === "string") {
      return message[0];
    }
  }
  if (status === 429)
    return "Слишком много попыток. Подождите и попробуйте снова";
  return "Не удалось связаться с сервером";
}
