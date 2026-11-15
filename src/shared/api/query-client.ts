import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // С SSR задаём staleTime > 0, чтобы клиент сразу не перезапрашивал данные с сервера
        staleTime: 60 * 1000,
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
