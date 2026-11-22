"use client";

import { useMemo, useState } from "react";

import {
  BADGE_LABELS,
  type MenuItem,
  MenuItemCard,
  type MenuItemBadge,
  usePublicMenu,
} from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { cn } from "@/shared/lib/utils";

import { filterByBadge, presentBadges } from "../lib/filter-by-badge";

const chipClass =
  "flex min-h-11 items-center rounded-full border px-4 whitespace-nowrap transition-colors";

// onOpenItem — касание по фото или названию: страница открывает шторку товара.
export function MenuList({
  onOpenItem,
}: {
  onOpenItem?: (item: MenuItem) => void;
}) {
  const { data: allCategories } = usePublicMenu();
  const [badge, setBadge] = useState<MenuItemBadge | null>(null);
  const badges = useMemo(() => presentBadges(allCategories), [allCategories]);
  // Метка могла пропасть после обновления меню — тогда показываем всё.
  const activeBadge = badge && badges.includes(badge) ? badge : null;
  const categories = useMemo(
    () => filterByBadge(allCategories, activeBadge),
    [allCategories, activeBadge],
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
      <div className="flex flex-col gap-2">
        {badges.length > 0 && (
          <div
            role="group"
            aria-label="Подборки"
            className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4"
          >
            <ul className="flex gap-2">
              {[null, ...badges].map((value) => {
                const pressed = value === activeBadge;
                return (
                  <li key={value ?? "all"}>
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setBadge(value)}
                      className={cn(
                        chipClass,
                        pressed
                          ? "border-copper bg-copper text-charcoal"
                          : "border-border hover:bg-muted",
                      )}
                    >
                      {value ? BADGE_LABELS[value] : "Всё меню"}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <nav
          aria-label="Разделы меню"
          className="-mx-4 [scrollbar-width:none] overflow-x-auto px-4"
        >
          <ul className="flex gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <a
                  href={`#${category.slug}`}
                  className={cn(
                    chipClass,
                    "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {category.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {categories.map((category) => (
        <section
          key={category.id}
          id={category.slug}
          aria-labelledby={`${category.slug}-title`}
          className="scroll-mt-36 sm:scroll-mt-24"
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
