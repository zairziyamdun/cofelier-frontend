import { useMutation } from "@tanstack/react-query";

import { useInvalidateMenu } from "@/entities/menu-item";
import { ensureOk, http, unwrap, type ApiSchemas } from "@/shared/api";

export type GroupBody = ApiSchemas["CreateModifierGroupDto"];
export type GroupPatch = ApiSchemas["UpdateModifierGroupDto"];
export type OptionBody = ApiSchemas["CreateModifierOptionDto"];
export type OptionPatch = ApiSchemas["UpdateModifierOptionDto"];

// Любая правка добавок меняет и публичное меню (цены, варианты) — инвалидируем всё меню.
export function useCreateGroup() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async (body: GroupBody) =>
      unwrap(await http.POST("/api/menu/modifier-groups", { body })),
    onSuccess: invalidate,
  });
}

export function useUpdateGroup() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: GroupPatch }) =>
      unwrap(
        await http.PATCH("/api/menu/modifier-groups/{id}", {
          params: { path: { id } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteGroup() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async (id: number) =>
      ensureOk(
        await http.DELETE("/api/menu/modifier-groups/{id}", {
          params: { path: { id } },
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useAddOption() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async ({
      groupId,
      body,
    }: {
      groupId: number;
      body: OptionBody;
    }) =>
      unwrap(
        await http.POST("/api/menu/modifier-groups/{id}/options", {
          params: { path: { id: groupId } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useUpdateOption() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: OptionPatch }) =>
      unwrap(
        await http.PATCH("/api/menu/modifier-options/{id}", {
          params: { path: { id } },
          body,
        }),
      ),
    onSuccess: invalidate,
  });
}

export function useDeleteOption() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async (id: number) =>
      unwrap(
        await http.DELETE("/api/menu/modifier-options/{id}", {
          params: { path: { id } },
        }),
      ),
    onSuccess: invalidate,
  });
}
