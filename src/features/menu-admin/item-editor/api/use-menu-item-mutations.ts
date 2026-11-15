import { useMutation } from "@tanstack/react-query";

import { useInvalidateMenu } from "@/entities/menu-item";
import { ensureOk, http, unwrap, type ApiSchemas } from "@/shared/api";

export type MenuItemBody = ApiSchemas["CreateMenuItemDto"];

export function useCreateMenuItem() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (body: MenuItemBody) =>
      unwrap(await http.POST("/api/menu/items", { body })),
    onSuccess: invalidateMenu,
  });
}

export function useUpdateMenuItem() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: MenuItemBody }) =>
      unwrap(
        await http.PATCH("/api/menu/items/{id}", {
          params: { path: { id } },
          body,
        }),
      ),
    onSuccess: invalidateMenu,
  });
}

export function useDeleteMenuItem() {
  const invalidateMenu = useInvalidateMenu();
  return useMutation({
    mutationFn: async (id: number) =>
      ensureOk(
        await http.DELETE("/api/menu/items/{id}", { params: { path: { id } } }),
      ),
    onSuccess: invalidateMenu,
  });
}
