"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { type MenuItem, usePopularMenu } from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { ProductSheet } from "@/widgets/product-sheet";

import { popular } from "../config/content";
import { POPULAR_FETCH_LIMIT, POPULAR_SHOWN } from "../config/popular";

import { PopularSkeleton } from "./PopularSkeleton";
import { PopularTrack } from "./PopularTrack";

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

      <PopularTrack items={items} onOpen={setOpen} />
      <ProductSheet item={open} onClose={() => setOpen(null)} />
    </div>
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
