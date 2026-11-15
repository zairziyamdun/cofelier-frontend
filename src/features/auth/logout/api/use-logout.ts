import { useMutation, useQueryClient } from "@tanstack/react-query";

import { userKeys } from "@/entities/user";
import { http } from "@/shared/api";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await http.POST("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(userKeys.current(), null);
    },
  });
}
