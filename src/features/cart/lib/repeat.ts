import {
  type MenuCategory,
  selectedModifiers,
  selectionPrice,
} from "@/entities/menu-item";
import type { RepeatOrder } from "@/entities/order";

import type { CartLineDraft } from "../model/cart-store";

// Прошлый заказ → строки корзины по свежему меню. Что сервер отметил
// недоступным или чего нет в загруженном меню — отдельно, с причиной.
export function repeatToCart(
  repeat: RepeatOrder,
  categories: MenuCategory[],
): {
  lines: { draft: CartLineDraft; quantity: number }[];
  unavailable: { name: string; reason: string }[];
} {
  const items = new Map(
    categories.flatMap((category) =>
      category.items.map((item) => [item.id, item] as const),
    ),
  );
  const lines: { draft: CartLineDraft; quantity: number }[] = [];
  const unavailable: { name: string; reason: string }[] = [];

  for (const line of repeat.lines) {
    const item = items.get(line.menuItemId);
    if (!line.available || !item) {
      unavailable.push({
        name: line.name,
        reason: line.reason ?? "Сейчас нет в меню",
      });
      continue;
    }
    const selection = new Map(
      line.modifiers.map((modifier) => [modifier.optionId, modifier.quantity]),
    );
    lines.push({
      draft: {
        menuItemId: item.id,
        name: item.name,
        price: selectionPrice(item, selection),
        modifiers: selectedModifiers(item, selection),
      },
      quantity: line.quantity,
    });
  }
  return { lines, unavailable };
}

// «2 × Капучино (Овсяное) · Круассан» — коротко, что было в заказе.
export function repeatSummary(repeat: RepeatOrder): string {
  return repeat.lines
    .map((line) =>
      line.quantity > 1 ? `${line.quantity} × ${line.name}` : line.name,
    )
    .join(" · ");
}
