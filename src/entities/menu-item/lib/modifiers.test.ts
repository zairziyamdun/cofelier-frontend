import { describe, expect, it } from "vitest";

import type { MenuItem, ModifierGroup } from "../model/types";
import {
  defaultSelection,
  groupError,
  selectedModifiers,
  selectionErrors,
  selectionPrice,
  setOptionQuantity,
  toggleOption,
} from "./modifiers";

const option = (
  id: number,
  name: string,
  extra: Partial<ModifierGroup["options"][number]> = {},
) => ({
  id,
  name,
  priceDelta: 0,
  isDefault: false,
  isAvailable: true,
  note: null,
  ...extra,
});

const size: ModifierGroup = {
  id: 1,
  name: "Объём",
  kind: "single",
  required: true,
  maxSelect: null,
  options: [
    option(11, "Стандарт", { isDefault: true }),
    option(12, "Большой", { priceDelta: 400 }),
  ],
};
const milk: ModifierGroup = {
  id: 2,
  name: "Молоко",
  kind: "single",
  required: false,
  maxSelect: null,
  options: [
    option(21, "Обычное", { isDefault: true }),
    option(22, "Овсяное", { priceDelta: 300, isAvailable: false }),
  ],
};
const syrup: ModifierGroup = {
  id: 3,
  name: "Сироп",
  kind: "multiple",
  required: false,
  maxSelect: 2,
  options: [
    option(31, "Карамель", { priceDelta: 200 }),
    option(32, "Ваниль", { priceDelta: 200 }),
    option(33, "Орех", { priceDelta: 200 }),
  ],
};
const shot: ModifierGroup = {
  id: 4,
  name: "Доп. шот",
  kind: "quantity",
  required: false,
  maxSelect: 2,
  options: [option(41, "Эспрессо", { priceDelta: 350 })],
};

const item = {
  id: 1,
  slug: "kapuchino",
  name: "Капучино",
  description: null,
  portion: null,
  price: 1500,
  photos: [],
  isAvailable: true,
  badges: [],
  modifierGroups: [size, milk, syrup, shot],
  defaultPrice: 1500,
} satisfies MenuItem;

describe("добавки в шторке", () => {
  it("по умолчанию — стандарт и обычное молоко", () => {
    expect([...defaultSelection(item)]).toEqual([
      [11, 1],
      [21, 1],
    ]);
  });

  it("цена: надбавки и количество шотов", () => {
    let selection = toggleOption(size, 12, defaultSelection(item));
    selection = toggleOption(syrup, 31, selection);
    selection = setOptionQuantity(shot, 41, 2, selection);
    expect(selectionPrice(item, selection)).toBe(1500 + 400 + 200 + 700);
  });

  it("«один»: выбор заменяет, обязательный не снимается повторным касанием", () => {
    const big = toggleOption(size, 12, defaultSelection(item));
    expect(big.has(11)).toBe(false);
    expect(big.has(12)).toBe(true);
    expect(toggleOption(size, 12, big).has(12)).toBe(true);
    // Необязательную группу повторное касание очищает.
    expect(toggleOption(milk, 21, big).has(21)).toBe(false);
  });

  it("лимиты: третий сироп и третий шот не добавляются", () => {
    let selection = toggleOption(syrup, 31, new Map());
    selection = toggleOption(syrup, 32, selection);
    selection = toggleOption(syrup, 33, selection);
    expect(selection.has(33)).toBe(false);
    expect(setOptionQuantity(shot, 41, 5, selection).get(41)).toBe(2);
    expect(setOptionQuantity(shot, 41, 0, selection).has(41)).toBe(false);
  });

  it("ошибки: обязательная группа и закончившийся вариант", () => {
    expect(groupError(size, new Map())).toBe("Выберите: объём");
    expect(groupError(milk, new Map([[22, 1]]))).toContain("закончился");
    expect(selectionErrors(item, defaultSelection(item))).toEqual([]);
  });

  it("подписи для корзины: в порядке групп, количество через ×", () => {
    const selection = setOptionQuantity(
      shot,
      41,
      2,
      toggleOption(syrup, 32, defaultSelection(item)),
    );
    expect(selectedModifiers(item, selection)).toEqual([
      { optionId: 11, quantity: 1, label: "Стандарт", isDefault: true },
      { optionId: 21, quantity: 1, label: "Обычное", isDefault: true },
      { optionId: 32, quantity: 1, label: "Ваниль", isDefault: false },
      { optionId: 41, quantity: 2, label: "Эспрессо ×2", isDefault: false },
    ]);
  });
});
