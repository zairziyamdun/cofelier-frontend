import { describe, expect, it } from "vitest";

import type { MenuCategory, MenuItem } from "@/entities/menu-item";

import { filterByBadge, presentBadges, searchMenu } from "./filter-by-badge";

const item = (id: number, badges: MenuItem["badges"]): MenuItem => ({
  id,
  slug: `item-${id}`,
  name: `Позиция ${id}`,
  description: id === 3 ? "Ёмкий вкус, сливки" : null,
  portion: null,
  price: 1000,
  photos: [],
  isAvailable: true,
  badges,
  modifierGroups: [],
  defaultPrice: 1000,
});

const menu: MenuCategory[] = [
  { id: 1, slug: "a", name: "А", items: [item(1, ["new"]), item(2, [])] },
  { id: 2, slug: "b", name: "Б", items: [item(3, ["popular", "decaf"])] },
];

describe("фильтр меню по меткам", () => {
  it("кнопки — только для меток, которые есть, в порядке важности", () => {
    expect(presentBadges(menu)).toEqual(["popular", "new", "decaf"]);
  });

  it("категории без позиций под метку пропадают", () => {
    const filtered = filterByBadge(menu, "new");
    expect(filtered.map((category) => category.slug)).toEqual(["a"]);
    expect(filtered[0].items.map((menuItem) => menuItem.id)).toEqual([1]);
    expect(filterByBadge(menu, null)).toBe(menu);
  });
});

describe("поиск по меню", () => {
  it("без учёта регистра и «ё», по названию и описанию", () => {
    expect(
      searchMenu(menu, "  ПОЗИЦИЯ 2 ").flatMap((c) => c.items.map((i) => i.id)),
    ).toEqual([2]);
    expect(
      searchMenu(menu, "емкий").flatMap((c) => c.items.map((i) => i.id)),
    ).toEqual([3]);
    expect(searchMenu(menu, "нет такого")).toEqual([]);
    expect(searchMenu(menu, " ")).toBe(menu);
  });
});
