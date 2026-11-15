import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  menuKeys,
  useInvalidateMenu,
  type ManagedMenuCategory,
} from "@/entities/menu-item";
import { http, unwrap } from "@/shared/api";

type StopListChange = { id: number; inStopList: boolean };

// Переключатель реагирует сразу (оптимистично); при ошибке — откат к прежнему меню.
export function useSetStopList() {
  const queryClient = useQueryClient();
  const invalidateMenu = useInvalidateMenu();

  return useMutation({
    mutationFn: async ({ id, inStopList }: StopListChange) =>
      unwrap(
        await http.PATCH("/api/menu/items/{id}/stop-list", {
          params: { path: { id } },
          body: { inStopList },
        }),
      ),
    onMutate: async ({ id, inStopList }) => {
      await queryClient.cancelQueries({ queryKey: menuKeys.manage() });
      const previous = queryClient.getQueryData<ManagedMenuCategory[]>(
        menuKeys.manage(),
      );
      queryClient.setQueryData<ManagedMenuCategory[]>(
        menuKeys.manage(),
        (categories) =>
          categories?.map((category) => ({
            ...category,
            items: category.items.map((item) =>
              item.id === id
                ? { ...item, inStopList, isAvailable: !inStopList }
                : item,
            ),
          })),
      );
      return { previous };
    },
    onError: (_error, _change, context) => {
      queryClient.setQueryData(menuKeys.manage(), context?.previous);
    },
    onSettled: invalidateMenu,
  });
}
