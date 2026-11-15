import { useMutation } from "@tanstack/react-query";

import { useInvalidateMenu } from "@/entities/menu-item";
import { ensureOk, http, unwrap } from "@/shared/api";

export function useCreateCategory() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (name: string) =>
      unwrap(await http.POST("/api/menu/categories", { body: { name } })),
    onSuccess: invalidateMenu,
  });
}

export function useRenameCategory() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) =>
      unwrap(
        await http.PATCH("/api/menu/categories/{id}", {
          params: { path: { id } },
          body: { name },
        }),
      ),
    onSuccess: invalidateMenu,
  });
}

export function useDeleteCategory() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (id: number) =>
      ensureOk(
        await http.DELETE("/api/menu/categories/{id}", {
          params: { path: { id } },
        }),
      ),
    onSuccess: invalidateMenu,
  });
}

// API принимает id всех категорий в новом порядке.
export function useReorderCategories() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (ids: number[]) =>
      unwrap(await http.PUT("/api/menu/categories/order", { body: { ids } })),
    onSuccess: invalidateMenu,
  });
}
