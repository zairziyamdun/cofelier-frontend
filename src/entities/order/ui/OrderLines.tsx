import { formatPrice } from "@/shared/lib/format-price";

import type { Order } from "../model/types";

// Строки заказа «2 × Латте» и итог; цены — на момент заказа (с добавками).
export function OrderLines({ order }: { order: Order }) {
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-col gap-1">
        {order.items.map((item) => (
          <li key={item.id} className="flex justify-between gap-4">
            <span className="min-w-0">
              <span className="text-muted-foreground">{item.quantity} ×</span>{" "}
              {item.name}
              <ModifierLine modifiers={item.modifiers} />
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

// Только отличия от вариантов по умолчанию, жирным: бариста видит их сразу,
// а «обычное молоко, без сахара» не мешает читать.
function ModifierLine({
  modifiers,
}: {
  modifiers: Order["items"][number]["modifiers"];
}) {
  const changed = modifiers.filter((modifier) => !modifier.isDefault);
  if (changed.length === 0) return null;
  return (
    <span className="block font-semibold break-words">
      {changed
        .map((modifier) =>
          modifier.quantity > 1
            ? `${modifier.optionName} ×${modifier.quantity}`
            : modifier.optionName,
        )
        .join(" · ")}
    </span>
  );
}
