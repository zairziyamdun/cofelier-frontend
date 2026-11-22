"use client";

import { useMemo, useState } from "react";

import {
  type MenuItem,
  MenuItemCard,
  type MenuItemBadge,
  usePublicMenu,
} from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";

import {
  filterByBadge,
  presentBadges,
  searchMenu,
} from "../lib/filter-by-badge";
import { useActiveSection, useHeaderHeight } from "../model/use-menu-scroll";
import { MenuNav } from "./MenuNav";

// Высота липкой полосы меню: py-2 и кнопки 44 px; плюс запас под заголовок.
const NAV_HEIGHT = 61;

// onOpenItem — касание по фото или названию: страница открывает шторку товара.
export function MenuList({
  onOpenItem,
}: {
  onOpenItem?: (item: MenuItem) => void;
}) {
  const { data: allCategories } = usePublicMenu();
  const [badge, setBadge] = useState<MenuItemBadge | null>(null);
  const [query, setQuery] = useState("");
  const headerHeight = useHeaderHeight();

  const badges = useMemo(() => presentBadges(allCategories), [allCategories]);
  // Метка могла пропасть после обновления меню — тогда показываем всё.
  const activeBadge = badge && badges.includes(badge) ? badge : null;
  const categories = useMemo(
    () => searchMenu(filterByBadge(allCategories, activeBadge), query),
    [allCategories, activeBadge, query],
  );
  const stickyBottom = headerHeight + NAV_HEIGHT;
  const activeSlug = useActiveSection(
    categories.map((category) => category.slug),
    stickyBottom,
  );

  if (allCategories.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Меню скоро появится — заходите чуть позже.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <MenuNav
        top={headerHeight}
        badges={badges}
        activeBadge={activeBadge}
        onBadge={setBadge}
        categories={categories}
        activeSlug={activeSlug}
        query={query}
        onQuery={setQuery}
      />

      {categories.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Ничего не нашли по запросу «{query.trim()}». Попробуйте короче.
        </p>
      )}

      {categories.map((category) => (
        <section
          key={category.id}
          id={category.slug}
          aria-labelledby={`${category.slug}-title`}
          // Переход по разделу не прячет заголовок под шапкой и полосой.
          style={{ scrollMarginTop: stickyBottom + 8 }}
        >
          <h2
            id={`${category.slug}-title`}
            className="mb-4 font-heading text-2xl md:text-3xl"
          >
            {category.name}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.items.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onOpen={onOpenItem ? () => onOpenItem(item) : undefined}
                action={
                  <AddToCartButton
                    item={item}
                    onChoose={onOpenItem ? () => onOpenItem(item) : undefined}
                  />
                }
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
