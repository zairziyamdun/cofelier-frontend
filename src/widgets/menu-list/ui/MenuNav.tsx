"use client";

import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  BADGE_LABELS,
  type MenuCategory,
  type MenuItemBadge,
} from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";

const chipClass =
  "flex min-h-11 shrink-0 items-center rounded-full border px-4 whitespace-nowrap transition-colors";

// Одна липкая полоса меню: поиск, подборки по меткам и разделы. Один ряд, а
// не два — на телефоне каждая строка над меню отнимает место у позиций.
export function MenuNav({
  top,
  badges,
  activeBadge,
  onBadge,
  categories,
  activeSlug,
  query,
  onQuery,
}: {
  top: number;
  badges: MenuItemBadge[];
  activeBadge: MenuItemBadge | null;
  onBadge: (badge: MenuItemBadge | null) => void;
  categories: MenuCategory[];
  activeSlug: string | null;
  query: string;
  onQuery: (query: string) => void;
}) {
  const [searching, setSearching] = useState(query !== "");
  const rowRef = useRef<HTMLDivElement>(null);

  // Активный раздел всегда виден в полосе: прокручиваем саму полосу, не
  // страницу. У первого раздела полоса в начале — там поиск и подборки.
  const firstSlug = categories[0]?.slug;
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    if (activeSlug === firstSlug) {
      row.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }
    const chip = row.querySelector<HTMLElement>(
      `[data-slug="${activeSlug ?? ""}"]`,
    );
    if (!chip) return;
    const start = chip.offsetLeft - row.offsetLeft;
    const end = start + chip.offsetWidth;
    const margin = 48;
    if (start < row.scrollLeft + margin) {
      row.scrollTo({ left: start - margin, behavior: "smooth" });
    } else if (end > row.scrollLeft + row.clientWidth - margin) {
      row.scrollTo({
        left: end - row.clientWidth + margin,
        behavior: "smooth",
      });
    }
  }, [activeSlug, firstSlug]);

  return (
    <div
      style={{ top }}
      className="sticky z-[5] -mx-4 border-b border-border bg-background/95 px-4 py-2 backdrop-blur"
    >
      {searching ? (
        <div className="flex items-center gap-2">
          <Search
            aria-hidden="true"
            className="size-5 shrink-0 text-muted-foreground"
          />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(event) => onQuery(event.currentTarget.value)}
            placeholder="Найти в меню"
            aria-label="Найти в меню"
            className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            aria-label="Закрыть поиск"
            onClick={() => {
              onQuery("");
              setSearching(false);
            }}
            className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-muted"
          >
            <X aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          ref={rowRef}
          className="flex [scrollbar-width:none] items-center gap-2 overflow-x-auto"
        >
          <button
            type="button"
            aria-label="Поиск по меню"
            onClick={() => setSearching(true)}
            className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-muted"
          >
            <Search aria-hidden="true" className="size-5" />
          </button>
          {badges.map((badge) => {
            const pressed = badge === activeBadge;
            return (
              <button
                key={badge}
                type="button"
                aria-pressed={pressed}
                // Повторное касание снимает подборку — отдельная «Всё меню» не нужна.
                onClick={() => onBadge(pressed ? null : badge)}
                className={cn(
                  chipClass,
                  pressed
                    ? "border-copper bg-copper text-charcoal"
                    : "border-border hover:bg-muted",
                )}
              >
                {BADGE_LABELS[badge]}
              </button>
            );
          })}
          {badges.length > 0 && (
            <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
          )}
          <nav aria-label="Разделы меню" className="contents">
            {categories.map((category) => {
              const current = category.slug === activeSlug;
              return (
                <a
                  key={category.id}
                  href={`#${category.slug}`}
                  data-slug={category.slug}
                  aria-current={current ? "location" : undefined}
                  className={cn(
                    chipClass,
                    current
                      ? "border-foreground/20 bg-muted text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {category.name}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
