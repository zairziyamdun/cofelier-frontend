import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

import { ApiError } from "./http";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // С SSR задаём staleTime > 0, чтобы клиент сразу не перезапрашивал данные с сервера
        staleTime: 60 * 1000,
        // По умолчанию TanStack повторяет 3 раза с паузами 1, 2, 4 с — экран
        // ошибки ждёт ~7 с. 4xx от повтора не изменится, сбой сервера — один раз.
        retry: (failures, error) =>
          failures < 1 && !(error instanceof ApiError && error.status < 500),
        retryDelay: 800,
      },
      dehydrate: {
        // Отдаём на клиент и незавершённые запросы (стриминг с prefetch на сервере)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // На сервере — новый клиент на каждый запрос, чтобы данные пользователей не смешивались
  if (isServer) return makeQueryClient();
  // В браузере — один клиент на всё приложение
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
