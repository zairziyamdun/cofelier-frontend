import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";

import { http, unwrap } from "@/shared/api";

import type { Staff } from "../model/types";

export const staffKeys = {
  all: ["staff"] as const,
  list: () => [...staffKeys.all, "list"] as const,
};

export function staffQueryOptions() {
  return queryOptions({
    queryKey: staffKeys.list(),
    queryFn: async (): Promise<Staff[]> =>
      unwrap(await http.GET("/api/users/staff")),
  });
}

// Список сотрудников для админа; грузится в браузере с его cookie.
export function useStaff() {
  return useQuery(staffQueryOptions());
}

export function useInvalidateStaff() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: staffKeys.all });
}
