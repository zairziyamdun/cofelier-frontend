"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { MenuItem } from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";

import { popular } from "../config/content";

import { PopularCard } from "./PopularCard";

const GAP = 16;
const PARALLAX_PX = 28;

// Лента листается по одной карточке. Пока листаем, она сама считает, какая
// карточка «в фокусе», двигает фото внутри рамок и тянет полосу прогресса —
// через ref, без перерисовки на каждый кадр.
export function PopularTrack({
  items,
  onOpen,
}: {
  items: MenuItem[];
  onOpen: (item: MenuItem) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const cards = Array.from(track.children) as HTMLElement[];
      const left = track.getBoundingClientRect().left;
      const max = track.scrollWidth - track.clientWidth;
      const progress = max > 0 ? track.scrollLeft / max : 1;
      barRef.current?.style.setProperty("transform", `scaleX(${progress})`);

      let nearest = 0;
      let nearestDistance = Infinity;
      cards.forEach((card, index) => {
        const offset = card.getBoundingClientRect().left - left;
        if (Math.abs(offset) < nearestDistance) {
          nearest = index;
          nearestDistance = Math.abs(offset);
        }
        if (!motion.matches) return;
        const shift = Math.max(-1, Math.min(1, offset / track.clientWidth));
        card
          .querySelector<HTMLElement>("[data-popular-photo]")
          ?.style.setProperty(
            "--shift",
            `${(shift * -PARALLAX_PX).toFixed(1)}px`,
          );
      });
      // В конце ленты последние карточки не доезжают до края — берём последнюю.
      setActive(progress > 0.98 ? cards.length - 1 : nearest);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    track.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    // Карточки появляются, когда лента доходит до экрана.
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { threshold: 0.15 },
    );
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [items.length]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    track.scrollBy({
      left: direction * (card.clientWidth + GAP),
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="relative h-px flex-1 overflow-hidden bg-cream/15"
        >
          <span
            ref={barRef}
            className="absolute inset-0 origin-left bg-copper transition-transform duration-200 ease-out"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
        <span
          aria-hidden="true"
          className="font-heading text-sm text-cream/60 tabular-nums"
        >
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(items.length).padStart(2, "0")}
        </span>
        {/* Стрелки — для мыши; на тач-экране ленту листают пальцем. */}
        <span className="hidden gap-2 pointer-fine:flex">
          {(["left", "right"] as const).map((side) => {
            const Icon = side === "left" ? ChevronLeft : ChevronRight;
            const disabled =
              side === "left" ? active === 0 : active === items.length - 1;
            return (
              <button
                key={side}
                type="button"
                aria-label={side === "left" ? "Назад" : "Дальше"}
                disabled={disabled}
                onClick={() => scrollByCard(side === "left" ? -1 : 1)}
                className="flex size-11 items-center justify-center rounded-full border border-cream/20 text-cream transition-colors hover:border-copper hover:text-copper disabled:pointer-events-none disabled:opacity-30"
              >
                <Icon aria-hidden="true" />
              </button>
            );
          })}
        </span>
      </div>

      <ul
        ref={trackRef}
        aria-label={popular.railLabel}
        // На телефоне карточка чуть уже экрана: видно, что дальше есть ещё.
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2"
      >
        {items.map((item, index) => (
          <li
            key={item.id}
            style={{ animationDelay: `${Math.min(index, 4) * 90}ms` }}
            className={cn(
              "w-[min(80vw,20rem)] shrink-0 snap-start motion-safe:animate-in motion-safe:duration-700 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-6",
              !visible && "motion-safe:[animation-play-state:paused]",
            )}
          >
            <PopularCard
              item={item}
              rank={index + 1}
              active={index === active}
              onOpen={() => onOpen(item)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
