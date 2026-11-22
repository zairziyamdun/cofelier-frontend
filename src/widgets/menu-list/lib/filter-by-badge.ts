import type { MenuCategory, MenuItemBadge } from "@/entities/menu-item";

const BADGE_ORDER: MenuItemBadge[] = [
  "popular",
  "new",
  "seasonal",
  "signature",
  "decaf",
];

// Метки, которые есть хотя бы у одной позиции: пустой фильтр не показываем.
export function presentBadges(categories: MenuCategory[]): MenuItemBadge[] {
  const present = new Set(
    categories.flatMap((category) =>
      category.items.flatMap((item) => item.badges),
    ),
  );
  return BADGE_ORDER.filter((badge) => present.has(badge));
}

// Категории только с позициями под метку; категории без них уходят целиком.
export function filterByBadge(
  categories: MenuCategory[],
  badge: MenuItemBadge | null,
): MenuCategory[] {
  if (!badge) return categories;
  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => item.badges.includes(badge)),
    }))
    .filter((category) => category.items.length > 0);
}

// «Раф» и «раф», «ё» и «е», лишние пробелы — одно и то же.
export function normalizeSearch(text: string): string {
  return text.trim().toLowerCase().replaceAll("ё", "е").replace(/\s+/g, " ");
}

// Поиск по названию и описанию; категории без совпадений пропадают.
export function searchMenu(
  categories: MenuCategory[],
  query: string,
): MenuCategory[] {
  const needle = normalizeSearch(query);
  if (!needle) return categories;
  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        normalizeSearch(`${item.name} ${item.description ?? ""}`).includes(
          needle,
        ),
      ),
    }))
    .filter((category) => category.items.length > 0);
}
