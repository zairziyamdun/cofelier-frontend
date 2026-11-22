"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import type { MenuItem } from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";

import { popular } from "../config/content";

import { PopularCard } from "./PopularCard";

const GAP = 16;
const PARALLAX_PX = 28;
// Медленный непрерывный ход: px в секунду.
const AUTO_SPEED = 28;
// Сколько лента молчит после ручного листания, потом едет дальше с того же места.
const IDLE_MS = 3000;
const DRAG_THRESHOLD = 6;
// Три одинаковых набора карточек подряд; едем по среднему и при выходе
// за его пределы незаметно сдвигаемся на длину набора — получается бесконечный круг.
const SETS = 3;
const FOCUSABLE = "a[href],button,input,select,textarea,[tabindex]";

// Лента листается пальцем, мышью (перетаскивание) и стрелками, а когда её не
// трогают — сама медленно едет по кругу. Пока листаем, лента считает, какая
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
  const pauseUntil = useRef(0);
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(false);

  // Набор повторяем, если карточек так мало, что он не заполнит экран.
  const repeat = items.length < 6 ? 2 : 1;
  const setLength = items.length * repeat;
  const slides = useMemo(
    () =>
      Array.from({ length: SETS * setLength }, (_, index) => {
        const inSet = index % setLength;
        return {
          item: items[inSet % items.length],
          // Настоящая только первая копия среднего набора, остальные — для круга.
          real: Math.floor(index / setLength) === 1 && inSet < items.length,
          key: `${Math.floor(index / setLength)}-${inSet}`,
        };
      }),
    [items, setLength],
  );

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let frame = 0;
    let setWidth = 0;

    const measure = () => {
      const cards = track.children;
      const first = cards[0] as HTMLElement | undefined;
      const next = cards[setLength] as HTMLElement | undefined;
      setWidth = first && next ? next.offsetLeft - first.offsetLeft : 0;
    };
    // Держим позицию в пределах среднего набора с запасом: сдвиг на набор
    // невидим, потому что карточки там те же. Возвращает величину сдвига.
    const wrap = () => {
      if (setWidth <= 0) return 0;
      const x = track.scrollLeft;
      const high = Math.min(
        setWidth * 2.25,
        track.scrollWidth - track.clientWidth - 50,
      );
      const low = setWidth * 0.25;
      let shift = 0;
      if (x > high) shift = -setWidth;
      else if (x < low) shift = setWidth;
      if (shift) track.scrollLeft = x + shift;
      return shift;
    };

    measure();
    track.scrollLeft = setWidth;

    const update = () => {
      frame = 0;
      const cards = Array.from(track.children) as HTMLElement[];
      const left = track.getBoundingClientRect().left;
      const phase =
        setWidth > 0
          ? (((track.scrollLeft - setWidth) % setWidth) + setWidth) % setWidth
          : 0;
      barRef.current?.style.setProperty(
        "transform",
        `scaleX(${setWidth > 0 ? phase / setWidth : 0})`,
      );

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
      setActive((nearest % setLength) % items.length);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    // --- Автоход ---
    let inView = false;
    let focused = false;
    let pressed = false;
    let position = track.scrollLeft;
    // Куда лента встала после нашей последней записи: всё, что отличается, —
    // это гость (касание, колесо, инерция), и автоход уступает.
    let expected = track.scrollLeft;
    let wasAuto = false;
    let last = performance.now();
    let autoFrame = 0;
    const pause = () => {
      pauseUntil.current = performance.now() + IDLE_MS;
    };

    const onScroll = () => {
      schedule();
      if (Math.abs(track.scrollLeft - expected) > 1.5) {
        pause();
        // Сдвиг на набор делаем только когда гость не тянет ленту мышью.
        if (!pressed) wrap();
        expected = track.scrollLeft;
      }
    };

    const tick = (now: number) => {
      autoFrame = requestAnimationFrame(tick);
      const dt = Math.min(now - last, 64);
      last = now;
      const auto =
        motion.matches &&
        inView &&
        !focused &&
        !pressed &&
        !document.hidden &&
        now > pauseUntil.current;
      if (auto !== wasAuto) {
        wasAuto = auto;
        // Продолжаем с того места, где лента сейчас, а не с начала.
        if (auto) position = track.scrollLeft;
      }
      if (!auto) return;

      position += (AUTO_SPEED * dt) / 1000;
      track.scrollLeft = position;
      const shift = wrap();
      if (shift) position += shift;
      expected = track.scrollLeft;
    };

    // --- Перетаскивание мышью (пальцем лента листается сама) ---
    let startX = 0;
    let startScroll = 0;
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
      moved = true;
      track.scrollLeft = startScroll - dx;
      startScroll += wrap();
      expected = track.scrollLeft;
      pause();
    };
    const onUp = () => {
      if (!pressed) return;
      pressed = false;
      pause();
    };
    // Клик, которым закончилось перетаскивание, карточку не открывает.
    const onClickCapture = (event: MouseEvent) => {
      if (!moved) return;
      moved = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onFocusIn = () => (focused = true);
    const onFocusOut = () => {
      focused = false;
      pause();
    };
    const preventImageDrag = (event: Event) => event.preventDefault();
    const onResize = () => {
      const oldWidth = setWidth;
      const phase = oldWidth > 0 ? (track.scrollLeft - oldWidth) / oldWidth : 0;
      measure();
      track.scrollLeft = setWidth * (1 + phase);
      position = track.scrollLeft;
      expected = track.scrollLeft;
      schedule();
    };

    // Копии нужны только глазам: фокус с клавиатуры в них не заходит.
    const hideClones = () => {
      for (const slide of Array.from(track.children)) {
        if (!slide.hasAttribute("data-clone")) continue;
        for (const node of Array.from(
          slide.querySelectorAll<HTMLElement>(FOCUSABLE),
        )) {
          if (node.tabIndex !== -1) node.tabIndex = -1;
        }
      }
    };
    hideClones();
    // Счётчик в корзине меняет кнопки внутри карточек — копии догоняем.
    const mutations = new MutationObserver(hideClones);
    mutations.observe(track, { childList: true, subtree: true });

    update();
    autoFrame = requestAnimationFrame(tick);
    track.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    track.addEventListener("pointerdown", onDown);
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
      mutations.disconnect();
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      track.removeEventListener("pointerdown", onDown);
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
  }, [items.length, setLength]);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    const card = track?.querySelector("li");
    if (!track || !card) return;
    pauseUntil.current = performance.now() + IDLE_MS;
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
            className="absolute inset-0 origin-left bg-copper"
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
          className="relative -mx-4 flex [scrollbar-width:none] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2"
        >
          {slides.map((slide, index) => (
            <li
              key={slide.key}
              aria-hidden={slide.real ? undefined : true}
              data-clone={slide.real ? undefined : ""}
              style={{ animationDelay: `${Math.min(index % 5, 4) * 90}ms` }}
              className={cn(
                "w-[min(72vw,16rem)] shrink-0 select-none motion-safe:animate-in motion-safe:duration-700 motion-safe:fill-mode-backwards motion-safe:fade-in motion-safe:slide-in-from-bottom-6",
                !visible && "motion-safe:[animation-play-state:paused]",
              )}
            >
              <PopularCard
                item={slide.item}
                rank={(index % setLength) + 1}
                active={slide.real && index % setLength === active}
                onOpen={() => onOpen(slide.item)}
              />
            </li>
          ))}
        </ul>
        {/* Стрелки на середине карточек, по краям ленты; пальцем лента и так листается. */}
        {(["left", "right"] as const).map((side) => {
          const Icon = side === "left" ? ChevronLeft : ChevronRight;
          return (
            <button
              key={side}
              type="button"
              aria-label={side === "left" ? "Назад" : "Дальше"}
              onClick={() => scrollByCard(side === "left" ? -1 : 1)}
              className={cn(
                "absolute top-[calc(50%-0.25rem)] hidden size-12 -translate-y-1/2 items-center justify-center rounded-full border border-cream/20 bg-charcoal/80 text-cream shadow-lg backdrop-blur transition-colors hover:border-copper hover:text-copper pointer-fine:flex",
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
