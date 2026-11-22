import { useMutation, useQueryClient } from "@tanstack/react-query";

import { orderKeys, type Order } from "@/entities/order";
import { http, unwrap, type ApiSchemas } from "@/shared/api";

type CreateOrderBody = ApiSchemas["CreateOrderDto"];

export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOrderBody) =>
      unwrap(await http.POST("/api/orders", { body })),
    // Новый заказ сразу наверху «Моих заказов», без лишнего запроса.
    onSuccess: (order) => {
      queryClient.setQueryData<Order[]>(orderKeys.my(), (orders) =>
        orders ? [order, ...orders] : orders,
      );
      // «Повторить» теперь про этот заказ.
      void queryClient.invalidateQueries({ queryKey: orderKeys.repeat() });
    },
  });
}
