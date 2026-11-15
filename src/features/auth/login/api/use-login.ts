import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/entities/user";
import { http, unwrap, type ApiSchemas } from "@/shared/api";

type LoginBody = ApiSchemas["LoginDto"];

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: LoginBody) =>
      unwrap(await http.POST("/api/auth/login", { body })),
    // Шапка и кнопки сразу видят пользователя, без запроса /auth/me.
    onSuccess: (user) => queryClient.setQueryData(userKeys.current(), user),
  });
}
