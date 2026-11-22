import { useMutation } from "@tanstack/react-query";

import { useInvalidateMenu } from "@/entities/menu-item";
import { http, unwrap } from "@/shared/api";

export function useSetItemGroups(itemId: number) {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: async (groupIds: number[]) =>
      unwrap(
        await http.PUT("/api/menu/items/{id}/modifier-groups", {
          params: { path: { id: itemId } },
          body: { groupIds },
        }),
      ),
    onSuccess: invalidate,
  });
}
