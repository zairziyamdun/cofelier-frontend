import { queryOptions, useQuery } from "@tanstack/react-query";

import { http, unwrap } from "@/shared/api";

import type { User } from "../model/types";

export const userKeys = {
  all: ["user"] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// 401 — не ошибка, а «гость»: возвращаем null.
async function fetchCurrentUser(): Promise<User | null> {
  const result = await http.GET("/api/auth/me");
  if (result.response.status === 401) return null;
  return unwrap(result);
}

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: userKeys.current(),
    queryFn: fetchCurrentUser,
  });
}

// Для шапки и кнопок в браузере; серверные страницы берут пользователя из shared/session.
// unavailable — сервер не ответил, и вход неизвестен: это не «гость».
// Перезапрос после ошибки снова переводит запрос в pending, поэтому
// прошлую ошибку узнаём по errorUpdatedAt, чтобы кнопка не мигала.
export function useCurrentUser() {
  const query = useQuery(currentUserQueryOptions());
  const unavailable = query.data === undefined && query.errorUpdatedAt > 0;
  return {
    ...query,
    unavailable,
    isPending: query.isPending && !unavailable,
  };
}
