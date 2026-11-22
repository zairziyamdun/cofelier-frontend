import { describe, expect, it } from "vitest";

import type { MenuCategory } from "@/entities/menu-item";

import { lineKey, toCartLine, type CartLine } from "../model/cart-store";
import { repriceLine } from "./reprice";

const menu: MenuCategory[] = [
  {
    id: 1,
    slug: "espresso",
    name: "Эспрессо и классика",
    items: [
      {
        id: 3,
        slug: "kapuchino",
        name: "Капучино",
        description: null,
        portion: null,
        price: 1600,
        photos: [],
        isAvailable: true,
        badges: [],
        defaultPrice: 1600,
        modifierGroups: [
          {
            id: 2,
            name: "Молоко",
            kind: "single",
            required: false,
            maxSelect: null,
            options: [
              {
                id: 21,
                name: "Обычное",
                priceDelta: 0,
                isDefault: true,
                isAvailable: true,
                note: null,
              },
              {
                id: 22,
                name: "Овсяное",
                priceDelta: 300,
                isDefault: false,
                isAvailable: false,
                note: null,
              },
            ],
          },
        ],
      },
    ],
  },
];

function line(overrides: Partial<CartLine> = {}): CartLine {
  return {
    key: "3:21x1",
    menuItemId: 3,
    name: "Капучино",
    price: 1500,
    quantity: 1,
    modifiers: [
      { optionId: 21, quantity: 1, label: "Обычное", isDefault: true },
    ],
    ...overrides,
  };
}

describe("строки корзины", () => {
  it("ключ не зависит от порядка добавок", () => {
    expect(
      lineKey(3, [
        { optionId: 22, quantity: 1 },
        { optionId: 11, quantity: 2 },
      ]),
    ).toBe("3:11x2,22x1");
    expect(lineKey(3, [])).toBe("3:");
  });

  it("старая строка без добавок и ключа дополняется, мусор отбрасывается", () => {
    expect(
      toCartLine({ menuItemId: 3, name: "Капучино", price: 1500, quantity: 2 }),
    ).toEqual({
      key: "3:",
      menuItemId: 3,
      name: "Капучино",
      price: 1500,
      quantity: 2,
      modifiers: [],
    });
    expect(toCartLine({ menuItemId: "3" })).toBeNull();
    expect(toCartLine(null)).toBeNull();
  });
});

describe("пересчёт по свежему меню", () => {
  it("новая цена позиции", () => {
    expect(repriceLine(menu, line())).toEqual({ price: 1600 });
  });

  it("позиции нет, вариант закончился или исчез — строку не собрать", () => {
    expect(repriceLine(menu, line({ menuItemId: 99 }))).toBeNull();
    expect(
      repriceLine(
        menu,
        line({
          modifiers: [
            { optionId: 22, quantity: 1, label: "Овсяное", isDefault: false },
          ],
        }),
      ),
    ).toBeNull();
    expect(
      repriceLine(
        menu,
        line({
          modifiers: [
            { optionId: 77, quantity: 1, label: "Кокос", isDefault: false },
          ],
        }),
      ),
    ).toBeNull();
  });
});
