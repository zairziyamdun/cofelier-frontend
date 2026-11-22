"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import {
  type MenuItem,
  MenuItemBadges,
  MenuPhotoImage,
  usePopularMenu,
} from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { ProductSheet } from "@/widgets/product-sheet";

import { popular } from "../config/content";
import { POPULAR_FETCH_LIMIT, POPULAR_SHOWN } from "../config/popular";

import { PopularSkeleton } from "./PopularSkeleton";

// «Любимое гостей»: лента карточек, листается по одной. «+» — как в меню:
// с добавками по умолчанию; касание по карточке — шторка товара.
export function PopularRail() {
  const { data, isPending, isError } = usePopularMenu(POPULAR_FETCH_LIMIT);
  const items = useMemo(
    () =>
      (data ?? [])
        .filter((item) => item.photos.length > 0)
        .slice(0, POPULAR_SHOWN),
    [data],
  );
  const [open, setOpen] = useState<MenuItem | null>(null);

  if (isPending) return <PopularSkeleton />;
  if (isError || items.length === 0) return <PopularFallback />;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-16 sm:py-24">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2
            id="popular-title"
            className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
          >
            {popular.eyebrow}
          </h2>
          <p className="font-heading text-[clamp(1.75rem,4vw,3rem)] leading-tight text-cream">
            {popular.title}
          </p>
        </div>
        <Link
          href={popular.menuCta.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "group/link min-h-11 rounded-full px-4 text-cream/80 hover:bg-transparent hover:text-copper",
          )}
        >
          {popular.menuCta.label}
          <ArrowRight
            aria-hidden="true"
            className="transition-transform group-hover/link:translate-x-1"
          />
        </Link>
      </header>

      <Rail items={items} onOpen={setOpen} />
      <ProductSheet item={open} onClose={() => setOpen(null)} />
    </div>
  );
}

function Rail({
  items,
  onOpen,
}: {
  items: MenuItem[];
  onOpen: (item: MenuItem) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    track.scrollBy({
      left: direction * (card.clientWidth + 16),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <ul
        ref={trackRef}
        aria-label={popular.railLabel}
        // На телефоне карточка чуть уже экрана: видно, что дальше есть ещё.
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            style={{ animationDelay: `${Math.min(index, 4) * 80}ms` }}
            className="w-[min(78vw,18rem)] shrink-0 snap-start motion-safe:animate-in motion-safe:duration-700 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
          >
            <RailCard item={item} onOpen={() => onOpen(item)} />
          </li>
        ))}
      </ul>
      {/* Стрелки — для мыши; на тач-экране ленту листают пальцем. */}
      {(["left", "right"] as const).map((side) => {
        const Icon = side === "left" ? ChevronLeft : ChevronRight;
        return (
          <button
            key={side}
            type="button"
            aria-label={side === "left" ? "Назад" : "Дальше"}
            onClick={() => scrollByCard(side === "left" ? -1 : 1)}
            className={cn(
              "absolute top-1/3 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-cream/15 bg-charcoal/70 text-cream backdrop-blur transition-colors hover:border-copper pointer-fine:flex",
              side === "left" ? "-left-2" : "-right-2",
            )}
          >
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function RailCard({ item, onOpen }: { item: MenuItem; onOpen: () => void }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-cream/10 bg-cream/[0.04] text-cream">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Подробнее: ${item.name}`}
        className="relative aspect-[4/5] w-full overflow-hidden"
      >
        <MenuPhotoImage
          photo={item.photos[0]}
          alt={item.name}
          sizes="(min-width: 640px) 18rem, 78vw"
          className="transition-transform duration-500 hover:scale-[1.03]"
        />
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <MenuItemBadges badges={item.badges} tone="dark" />
        <button
          type="button"
          onClick={onOpen}
          className="text-left font-heading text-xl leading-snug"
        >
          {item.name}
        </button>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="font-semibold text-copper">
            {formatPrice(item.defaultPrice ?? item.price)}
          </span>
          <AddToCartButton
            item={item}
            onChoose={onOpen}
            className="rounded-full border-copper bg-copper text-charcoal hover:bg-copper/85 hover:text-charcoal dark:border-copper dark:bg-copper dark:hover:bg-copper/85"
          />
        </div>
      </div>
    </article>
  );
}

function PopularFallback() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-24">
      <h2
        id="popular-title"
        className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
      >
        {popular.eyebrow}
      </h2>
      <p className="max-w-xl font-heading text-[clamp(1.75rem,4vw,3rem)] leading-tight text-cream">
        {popular.errorText}
      </p>
      <Link
        href={popular.menuCta.href}
        className={cn(
          buttonVariants({ size: "lg", variant: "outline" }),
          "min-h-12 rounded-full border-cream/30 bg-transparent px-8 text-base text-cream hover:bg-cream/10 hover:text-cream",
        )}
      >
        {popular.menuCta.label}
      </Link>
    </div>
  );
}
