"use client";

import { useQueryErrorResetBoundary } from "@tanstack/react-query";

// Для error.tsx: без сброса запрос с ошибкой из кеша снова бросит её при
// повторном рендере, раньше чем HydrationBoundary подставит свежие данные.
export function useQueryRetry(retry: () => void) {
  const { reset } = useQueryErrorResetBoundary();
  return () => {
    reset();
    retry();
  };
}
