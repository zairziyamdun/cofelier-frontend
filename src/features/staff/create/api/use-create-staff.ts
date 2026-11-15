import { useMutation } from "@tanstack/react-query";

import { useInvalidateStaff } from "@/entities/user";
import { http, unwrap, type ApiSchemas } from "@/shared/api";

type CreateStaffBody = ApiSchemas["CreateStaffDto"];

export function useCreateStaff() {
  const invalidateStaff = useInvalidateStaff();
  return useMutation({
    mutationFn: async (body: CreateStaffBody) =>
      unwrap(await http.POST("/api/users/staff", { body })),
    onSuccess: invalidateStaff,
  });
}
