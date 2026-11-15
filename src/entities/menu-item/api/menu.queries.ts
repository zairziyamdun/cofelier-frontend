import {
  queryOptions,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import { http, unwrap } from "@/shared/api";

import type { ManagedMenuCategory, MenuCategory } from "../model/types";

// Фабрика ключей: литералы queryKey в компонентах не пишем (FE-DATA-1).
// Мутации меню инвалидируют menuKeys.all — обновляются и сайт, и панель.
export const menuKeys = {
  all: ["menu"] as const,
  public: () => [...menuKeys.all, "public"] as const,
  manage: () => [...menuKeys.all, "manage"] as const,
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

async function fetchManagedMenu(): Promise<ManagedMenuCategory[]> {
  return unwrap(await http.GET("/api/menu/manage"));
}

export function managedMenuQueryOptions() {
  return queryOptions({
    queryKey: menuKeys.manage(),
    queryFn: fetchManagedMenu,
  });
}

// Меню для панели: грузится в браузере с cookie сотрудника.
export function useManagedMenu() {
  return useQuery(managedMenuQueryOptions());
}

// После любой правки меню: перечитать и панель, и публичное меню.
export function useInvalidateMenu() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: menuKeys.all });
}
