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
export function useCurrentUser() {
  return useQuery(currentUserQueryOptions());
}
