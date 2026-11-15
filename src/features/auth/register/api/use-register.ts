import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/entities/user";
import { http, unwrap, type ApiSchemas } from "@/shared/api";

type RegisterBody = ApiSchemas["RegisterDto"];

// Бэкенд после регистрации сразу ставит cookie — клиент уже вошёл.
export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: RegisterBody) =>
      unwrap(await http.POST("/api/auth/register", { body })),
    onSuccess: (user) => queryClient.setQueryData(userKeys.current(), user),
  });
}
