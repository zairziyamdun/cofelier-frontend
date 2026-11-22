import type { MenuItem, ModifierGroup } from "../model/types";

// Выбор добавок в шторке: id варианта → количество (у «один»/«несколько» — 1).
// Правила — те же, что на сервере (menu/modifier-selection.ts); сервер всё
// равно проверяет заказ сам, здесь — чтобы гость видел цену и ошибку сразу.
export type Selection = ReadonlyMap<number, number>;

export const MAX_OPTION_QUANTITY = 10;

// Что кладёт «+» в меню: варианты по умолчанию, кроме закончившихся.
export function defaultSelection(item: MenuItem): Map<number, number> {
  const result = new Map<number, number>();
  for (const group of item.modifierGroups) {
    const defaults = group.options.filter(
      (option) => option.isDefault && option.isAvailable,
    );
    const take = group.kind === "single" ? defaults.slice(0, 1) : defaults;
    for (const option of take) result.set(option.id, 1);
  }
  return result;
}

// Цена за штуку с выбранными добавками.
export function selectionPrice(item: MenuItem, selection: Selection): number {
  let price = item.price;
  for (const group of item.modifierGroups) {
    for (const option of group.options) {
      price += option.priceDelta * (selection.get(option.id) ?? 0);
    }
  }
  return price;
}

// Ошибка группы по-русски или null; лимиты кнопки и так не дают превысить.
export function groupError(
  group: ModifierGroup,
  selection: Selection,
): string | null {
  const picked = group.options.filter((option) => selection.has(option.id));
  if (group.required && picked.length === 0) {
    return `Выберите: ${group.name.toLowerCase()}`;
  }
  if (picked.some((option) => !option.isAvailable)) {
    return "Один из вариантов закончился — выберите другой";
  }
  return null;
}

export function selectionErrors(item: MenuItem, selection: Selection) {
  return item.modifierGroups.flatMap((group) => {
    const error = groupError(group, selection);
    return error ? [{ groupId: group.id, error }] : [];
  });
}

// Сколько ещё можно добавить в группу «количеством» или «несколько».
export function groupRemaining(
  group: ModifierGroup,
  selection: Selection,
): number {
  if (group.maxSelect === null) return Number.POSITIVE_INFINITY;
  const used = group.options.reduce(
    (sum, option) =>
      sum +
      (group.kind === "quantity"
        ? (selection.get(option.id) ?? 0)
        : selection.has(option.id)
          ? 1
          : 0),
    0,
  );
  return group.maxSelect - used;
}

// Новый выбор после касания по варианту: «один» — заменить, «несколько» —
// переключить (если не упёрлись в лимит).
export function toggleOption(
  group: ModifierGroup,
  optionId: number,
  selection: Selection,
): Map<number, number> {
  const next = new Map(selection);
  const selected = next.has(optionId);
  if (group.kind === "single") {
    for (const option of group.options) next.delete(option.id);
    // Повторное касание снимает выбор, только если группа не обязательна.
    if (!selected || group.required) next.set(optionId, 1);
    return next;
  }
  if (selected) next.delete(optionId);
  else if (groupRemaining(group, selection) > 0) next.set(optionId, 1);
  return next;
}

export function setOptionQuantity(
  group: ModifierGroup,
  optionId: number,
  quantity: number,
  selection: Selection,
): Map<number, number> {
  const next = new Map(selection);
  const current = next.get(optionId) ?? 0;
  const room = groupRemaining(group, selection) + current;
  const value = Math.max(0, Math.min(quantity, room, MAX_OPTION_QUANTITY));
  if (value === 0) next.delete(optionId);
  else next.set(optionId, value);
  return next;
}

// Добавки для корзины и заказа — в порядке групп, с подписью для строки.
export function selectedModifiers(item: MenuItem, selection: Selection) {
  return item.modifierGroups.flatMap((group) =>
    group.options
      .filter((option) => selection.has(option.id))
      .map((option) => {
        const quantity = selection.get(option.id) ?? 1;
        return {
          optionId: option.id,
          quantity,
          label: quantity > 1 ? `${option.name} ×${quantity}` : option.name,
          isDefault: option.isDefault,
        };
      }),
  );
}
