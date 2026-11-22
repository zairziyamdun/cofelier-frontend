import {
  type MenuCategory,
  selectionErrors,
  selectionPrice,
} from "@/entities/menu-item";

import type { CartLine } from "../model/cart-store";

// Цена строки корзины по свежему меню; null — строку больше не собрать
// (позиции нет, она или добавка закончилась, добавку убрали из группы).
export function repriceLine(
  categories: MenuCategory[],
  line: CartLine,
): { price: number } | null {
  const item = categories
    .flatMap((category) => category.items)
    .find((candidate) => candidate.id === line.menuItemId);
  if (!item?.isAvailable) return null;

  const options = new Map(
    item.modifierGroups.flatMap((group) =>
      group.options.map((option) => [option.id, option] as const),
    ),
  );
  if (line.modifiers.some((modifier) => !options.has(modifier.optionId))) {
    return null;
  }
  const selection = new Map(
    line.modifiers.map((modifier) => [modifier.optionId, modifier.quantity]),
  );
  if (selectionErrors(item, selection).length > 0) return null;
  return { price: selectionPrice(item, selection) };
}
