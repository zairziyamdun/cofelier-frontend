import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  isActiveStatus,
  orderKeys,
  type OrderStatus,
  type StaffOrder,
} from "@/entities/order";
import { http, unwrap } from "@/shared/api";

// Ответ сервера сразу кладётся в очередь; остальные бариста получат то же по WebSocket.
// Конфликт (заказ уже изменил другой) — перечитываем очередь.
export function useChangeOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: OrderStatus }) =>
      unwrap(
        await http.PATCH("/api/orders/{id}/status", {
          params: { path: { id } },
          body: { status },
        }),
      ),
    onSuccess: (order) =>
      queryClient.setQueryData<StaffOrder[]>(orderKeys.queue(), (queue) =>
        queue?.flatMap((item) => {
          if (item.id !== order.id) return [item];
          return isActiveStatus(order.status) ? [order] : [];
        }),
      ),
    onError: () =>
      void queryClient.invalidateQueries({ queryKey: orderKeys.queue() }),
  });
}
