import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";

import { http, unwrap } from "@/shared/api";

import type { MenuCategory } from "../model/types";

// Фабрика ключей: литералы queryKey в компонентах не пишем (FE-DATA-1).
export const menuKeys = {
  all: ["menu"] as const,
  public: () => [...menuKeys.all, "public"] as const,
};

async function fetchPublicMenu(): Promise<MenuCategory[]> {
  return unwrap(await http.GET("/api/menu"));
}

// Одни и те же опции на сервере (prefetch) и в браузере (хук) — общий ключ.
export function publicMenuQueryOptions() {
  return queryOptions({
    queryKey: menuKeys.public(),
    queryFn: fetchPublicMenu,
  });
}

// Ошибка загрузки уходит в ближайший error.tsx, загрузка — в <Suspense>.
export function usePublicMenu() {
  return useSuspenseQuery(publicMenuQueryOptions());
}
