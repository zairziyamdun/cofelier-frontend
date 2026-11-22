"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { MenuItem } from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";

import { popular } from "../config/content";

import { PopularCard } from "./PopularCard";

const PARALLAX_PX = 28;
// Медленный «карусельный» ход: px в секунду.
const AUTO_SPEED = 28;
// Сколько лента молчит после касания, стрелки или перетаскивания.
const IDLE_MS = 4000;
// Пауза в конце ленты перед возвратом к началу.
const END_PAUSE_MS = 1800;
const DRAG_THRESHOLD = 6;

// Лента: листается пальцем, мышью (перетаскивание) и стрелками по краям;
// сама медленно едет, пока гость её не трогает. Пока листаем, лента считает,
// какая карточка «в фокусе», двигает фото внутри рамок и тянет полосу
// прогресса — через ref, без перерисовки на каждый кадр.
export function PopularTrack({
  items,
  onOpen,
}: {
  items: MenuItem[];
  onOpen: (item: MenuItem) => void;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const pauseUntil = useRef(0);
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

    // --- Автоход ---
    let inView = false;
    let hovered = false;
    let focused = false;
    let position = track.scrollLeft;
    let wasAuto = false;
    let last = performance.now();
    let endedAt = 0;
    let autoFrame = 0;
    const pause = () => {
      pauseUntil.current = performance.now() + IDLE_MS;
    };

    const tick = (now: number) => {
      autoFrame = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 64);
      last = now;
      const dragging = track.hasAttribute("data-drag");
      const auto =
        motion.matches &&
        inView &&
        !hovered &&
        !focused &&
        !dragging &&
        !document.hidden &&
        now > pauseUntil.current;
      // Пока едем сами, прилипание отключено — иначе оно съедает дробные пиксели.
      if (auto !== wasAuto) {
        wasAuto = auto;
        if (auto) position = track.scrollLeft;
        if (auto) track.setAttribute("data-auto", "");
        else track.removeAttribute("data-auto");
      }
      if (!auto) return;

      const max = track.scrollWidth - track.clientWidth;
      if (position >= max - 1) {
        if (!endedAt) endedAt = now;
        if (now - endedAt > END_PAUSE_MS) {
          endedAt = 0;
          track.removeAttribute("data-auto");
          track.scrollTo({ left: 0, behavior: "smooth" });
          // Пока лента возвращается, автоход молчит.
          pauseUntil.current = now + 1400;
        }
        return;
      }
      position = Math.min(max, position + (AUTO_SPEED * dt) / 1000);
      track.scrollLeft = position;
    };
    autoFrame = requestAnimationFrame(tick);

    // --- Перетаскивание мышью (пальцем лента листается сама) ---
    let startX = 0;
    let startScroll = 0;
    let pressed = false;
    let moved = false;
    const onDown = (event: PointerEvent) => {
      pause();
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      pressed = true;
      moved = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
    };
    const onMove = (event: PointerEvent) => {
      if (!pressed) return;
      const dx = event.clientX - startX;
      if (!moved && Math.abs(dx) < DRAG_THRESHOLD) return;
      if (!moved) {
        moved = true;
        track.setAttribute("data-drag", "");
      }
      track.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      pause();
      track.removeAttribute("data-drag");
    };
    // Клик, которым закончилось перетаскивание, карточку не открывает.
    const onClickCapture = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hovered = true;
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      hovered = false;
      pause();
    };
    const onFocusIn = () => (focused = true);
    const onFocusOut = () => {
      focused = false;
      pause();
    };
    const preventImageDrag = (event: Event) => event.preventDefault();

    track.addEventListener("pointerdown", onDown);
    track.addEventListener("pointerenter", onEnter);
    track.addEventListener("pointerleave", onLeave);
    track.addEventListener("wheel", pause, { passive: true });
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("focusin", onFocusIn);
    track.addEventListener("focusout", onFocusOut);
    track.addEventListener("dragstart", preventImageDrag);
    track.addEventListener("click", onClickCapture, true);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    // Карточки появляются и лента едет, только пока она на экране.
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        if (inView) setVisible(true);
      },
      { threshold: 0.15 },
    );
    observer.observe(track);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(autoFrame);
      track.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      track.removeEventListener("pointerdown", onDown);
      track.removeEventListener("pointerenter", onEnter);
      track.removeEventListener("pointerleave", onLeave);
      track.removeEventListener("wheel", pause);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("focusin", onFocusIn);
      track.removeEventListener("focusout", onFocusOut);
      track.removeEventListener("dragstart", preventImageDrag);
      track.removeEventListener("click", onClickCapture, true);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      observer.disconnect();
    };
  }, [items.length]);

  const goTo = (index: number) => {
    const track = trackRef.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (!track || !card) return;
    pauseUntil.current = performance.now() + IDLE_MS;
    track.removeAttribute("data-auto");
    // 16 — левый отступ ленты (px-4), он же scroll-padding.
    track.scrollTo({ left: card.offsetLeft - 16, behavior: "smooth" });
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
      </div>

      <div className="relative">
        <ul
          ref={trackRef}
          aria-label={popular.railLabel}
          // На телефоне карточка чуть уже экрана: видно, что дальше есть ещё.
          className="relative -mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 data-auto:snap-none data-drag:cursor-grabbing data-drag:snap-none pointer-fine:cursor-grab"
        >
          {items.map((item, index) => (
            <li
              key={item.id}
              style={{ animationDelay: `${Math.min(index, 4) * 90}ms` }}
              className={cn(
                "w-[min(72vw,16rem)] shrink-0 snap-start select-none motion-safe:animate-in motion-safe:duration-700 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-6",
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
        {/* Стрелки на середине карточек, по краям ленты; пальцем лента и так листается. */}
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
              onClick={() => goTo(active + (side === "left" ? -1 : 1))}
              className={cn(
                "absolute top-[calc(50%-0.25rem)] hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-charcoal/80 text-cream shadow-lg backdrop-blur transition-[opacity,colors] hover:border-copper hover:text-copper disabled:pointer-events-none disabled:opacity-0 pointer-fine:flex",
                side === "left" ? "left-2" : "right-2",
              )}
            >
              <Icon aria-hidden="true" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
