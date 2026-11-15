import { formatPrice } from "@/shared/lib/format-price";

import type { Order } from "../model/types";

// Строки заказа «2 × Латте» и итог; цены — на момент заказа.
export function OrderLines({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span>
              <span className="text-muted-foreground">{item.quantity} ×</span>{" "}
              {item.name}
            </span>
            <span className="shrink-0 text-muted-foreground">
              {formatPrice(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-4 border-t border-border pt-2 font-semibold">
        <span>Итого</span>
        <span className="text-copper">{formatPrice(order.total)}</span>
      </div>
    </div>
  );
}
