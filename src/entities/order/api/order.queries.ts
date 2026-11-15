import { queryOptions, useQuery } from "@tanstack/react-query";

import { http, unwrap } from "@/shared/api";

import type { Order, StaffOrder } from "../model/types";

export const orderKeys = {
  all: ["orders"] as const,
  my: () => [...orderKeys.all, "my"] as const,
  queue: () => [...orderKeys.all, "queue"] as const,
};

export function myOrdersQueryOptions() {
  return queryOptions({
    queryKey: orderKeys.my(),
    queryFn: async (): Promise<Order[]> =>
      unwrap(await http.GET("/api/orders/my")),
  });
}

export function orderQueueQueryOptions() {
  return queryOptions({
    queryKey: orderKeys.queue(),
    queryFn: async (): Promise<StaffOrder[]> =>
      unwrap(await http.GET("/api/orders/queue")),
  });
}

// Оба списка обновляет WebSocket (useLiveOrders) — повторно не опрашиваем.
export function useMyOrders() {
  return useQuery({ ...myOrdersQueryOptions(), staleTime: Infinity });
}

export function useOrderQueue() {
  return useQuery({ ...orderQueueQueryOptions(), staleTime: Infinity });
}
