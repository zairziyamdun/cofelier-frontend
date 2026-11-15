import { useMutation } from "@tanstack/react-query";

import { useInvalidateStaff } from "@/entities/user";
import { http, unwrap, type ApiSchemas } from "@/shared/api";

type UpdateStaffBody = ApiSchemas["UpdateStaffDto"];

export function useUpdateStaff() {
  const invalidateStaff = useInvalidateStaff();
  return useMutation({
    mutationFn: async ({ id, body }: { id: number; body: UpdateStaffBody }) =>
      unwrap(
        await http.PATCH("/api/users/staff/{id}", {
          params: { path: { id } },
          body,
        }),
      ),
    // И при ошибке перечитываем: выпадающий список вернётся к реальной роли.
    onSettled: invalidateStaff,
  });
}
