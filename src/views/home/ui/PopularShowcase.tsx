"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { type MenuItem, usePopularMenu } from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { gsap, MOTION_OK, ScrollTrigger, useGSAP } from "@/shared/lib/gsap";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

import { popular } from "../config/content";
import {
  type DrinkImage,
  drinkImage,
  POPULAR_AUTOPLAY_MS,
  POPULAR_FETCH_LIMIT,
  POPULAR_SHOWN,
} from "../config/drinks";
import { magnetic } from "../lib/home-motion";

import { PopularSkeleton } from "./PopularSkeleton";

export function PopularShowcase() {
  const { data, isPending, isError } = usePopularMenu(POPULAR_FETCH_LIMIT);
  const drinks = useMemo(
    () =>
      (data ?? [])
        .flatMap((item) => {
          const image = drinkImage(item.name);
          return image ? [{ ...item, image }] : [];
        })
        .slice(0, POPULAR_SHOWN),
    [data],
  );

  if (isPending) return <PopularSkeleton />;
  if (isError || drinks.length === 0) return <PopularFallback />;
  return <Showcase drinks={drinks} />;
}

type Drink = MenuItem & { image: DrinkImage };

function Showcase({ drinks }: { drinks: Drink[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  // Автосмена идёт, пока гость не коснулся витрины; на телефоне её нет (см. полосу).
  const [autoplay, setAutoplay] = useState(true);
  const [inView, setInView] = useState(false);
  const active = drinks[Math.min(index, drinks.length - 1)];

  // Автосмена тикает, только когда витрина на экране.
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Витрина приходит позже соседей: пересчитать точки ScrollTrigger ниже.
  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, []);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const mm = gsap.matchMedia();
      mm.add(
        {
          motion: MOTION_OK,
          finePointer: "(hover: hover) and (pointer: fine)",
        },
        (context) => {
          const { motion, finePointer } = context.conditions as gsap.Conditions;
          if (!motion) return;
          return setupShowcaseMotion(root, Boolean(finePointer));
        },
      );
    },
    { scope: ref },
  );

  const pick = (next: number) => {
    setIndex(next);
    setAutoplay(false);
  };

  return (
    <div
      ref={ref}
      // Любое касание или фокус внутри — гость выбирает сам, автосмена стоп.
      onPointerDown={() => setAutoplay(false)}
      onFocusCapture={() => setAutoplay(false)}
      className="group/popular relative"
    >
      {/* Огромное название на фоне, как вывеска: едет вбок при прокрутке. */}
      <p
        aria-hidden="true"
        data-popular-word
        className="pointer-events-none absolute top-[30%] left-0 -z-10 font-heading text-[clamp(6rem,19vw,17rem)] leading-none whitespace-nowrap text-cream/[0.05] select-none lg:top-[6%]"
      >
        <span
          key={active.id}
          className="inline-block motion-safe:animate-in motion-safe:duration-1000 motion-safe:fade-in"
        >
          {active.name} · {active.name} · {active.name}
        </span>
      </p>

      {/* Сетка с областями: на телефоне — название, стакан, выбор, кнопка
          (выбрал и сразу купил, без прокрутки назад); на десктопе — как в макете. */}
      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-10 [grid-template-areas:'head'_'cup'_'pick'_'body'] sm:gap-8 sm:py-16 lg:min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)_minmax(0,1fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-8 lg:gap-y-6 lg:py-24 lg:[grid-template-areas:'._cup_.'_'head_cup_aside'_'body_cup_pick'_'._cup_.']">
        <div
          data-popular-reveal
          className="flex flex-col items-center gap-2 text-center [grid-area:head] lg:items-start lg:gap-6 lg:self-end lg:text-left"
        >
          <h2
            id="popular-title"
            className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
          >
            {popular.eyebrow}
          </h2>
          <div
            key={active.id}
            aria-live="polite"
            className="flex flex-col items-center gap-1 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in motion-safe:slide-in-from-bottom-4 lg:items-start lg:gap-4"
          >
            <p className="font-heading text-[clamp(2.25rem,4.2vw,4.25rem)] leading-[1.02] tracking-tight text-balance break-words">
              {active.name}
            </p>
            <p className="font-heading text-xl text-cream/80 lg:text-2xl">
              {active.portion && (
                <em className="text-copper italic">{active.portion}</em>
              )}
              {active.portion && " · "}
              {formatPrice(active.price)}
            </p>
          </div>
        </div>

        <div
          data-popular-reveal
          className="flex flex-col items-center gap-4 pt-1 text-center [grid-area:body] lg:items-start lg:gap-6 lg:self-start lg:pt-0 lg:text-left"
        >
          {active.description && (
            <p
              key={active.id}
              className="max-w-sm text-sm text-cream/70 motion-safe:animate-in motion-safe:duration-700 motion-safe:fade-in sm:text-base"
            >
              {active.description}
            </p>
          )}
          <div className="flex w-full items-center gap-2 sm:w-auto sm:gap-4">
            <span
              data-popular-magnetic
              className="inline-block min-w-0 flex-1 sm:flex-none"
            >
              <AddToCartButton
                menuItemId={active.id}
                name={active.name}
                price={active.price}
                // dark:* — у outline-кнопки в тёмной теме свой фон, его надо перебить.
                className="min-h-12 w-full rounded-full border-copper bg-copper px-8 text-base text-charcoal hover:bg-copper/85 hover:text-charcoal sm:w-auto dark:border-copper dark:bg-copper dark:hover:bg-copper/85"
              />
            </span>
            <Link
              href={popular.menuCta.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "lg" }),
                "group/link min-h-12 shrink-0 rounded-full px-4 text-base text-cream/80 hover:bg-transparent hover:text-copper",
              )}
            >
              {popular.menuCta.label}
              <ArrowRight
                aria-hidden="true"
                className="transition-transform duration-300 group-hover/link:translate-x-1"
              />
            </Link>
          </div>
        </div>

        {/* Стакан: смена напитка — наплыв, наклон за курсором. */}
        <div
          data-popular-cup-wrap
          className="relative mx-auto w-full [grid-area:cup] [perspective:1200px] lg:w-auto lg:self-center"
        >
          <div
            aria-hidden="true"
            className="absolute top-0 left-1/2 -z-10 aspect-square w-[120%] -translate-x-1/2 rounded-full model-spot lg:top-1/4 lg:w-[180%]"
          />
          <div
            data-popular-cup
            className="relative mx-auto h-[clamp(11rem,34svh,20rem)] w-[min(80vw,20rem)] [transform-style:preserve-3d] lg:aspect-[468/1159] lg:h-auto lg:w-[min(19rem,30vh)]"
          >
            {drinks.map((drink, drinkIndex) => (
              <Image
                key={drink.id}
                src={drink.image.src}
                alt={drinkIndex === index ? drink.name : ""}
                aria-hidden={drinkIndex !== index}
                width={468}
                height={1159}
                sizes="(min-width: 1024px) 30rem, 80vw"
                className={cn(
                  "absolute inset-0 size-full object-contain object-bottom transition-[opacity,translate,scale,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:inset-auto lg:bottom-0 lg:h-auto lg:object-fill",
                  // Десктоп: чашка эспрессо ниже стакана — крупнее и выше, в центре кадра.
                  drink.image.wide
                    ? "lg:bottom-[18%] lg:-left-[45%] lg:w-[190%]"
                    : "lg:left-0 lg:w-full",
                  drinkIndex === index
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-10 scale-95 opacity-0 blur-sm",
                )}
              />
            ))}
          </div>
          {/* Тень на «столе» — стакан стоит, а не висит. */}
          <div
            aria-hidden="true"
            className="absolute inset-x-[25%] -bottom-3 -z-10 h-6 rounded-[50%] bg-charcoal opacity-90 blur-xl lg:inset-x-[8%]"
          />
        </div>

        {/* Вводный абзац — только на десктопе: на телефоне он лишь удлиняет путь к заказу. */}
        <div
          data-popular-reveal
          className="hidden flex-col gap-3 [grid-area:aside] lg:flex lg:items-end lg:self-end lg:text-right"
        >
          <p className="font-heading text-[clamp(1.75rem,2.4vw,2.25rem)] leading-tight text-balance text-cream italic">
            {popular.aside}
          </p>
          <p className="max-w-xs text-sm text-cream/60">{popular.asideText}</p>
        </div>

        <div
          data-popular-reveal
          className="flex flex-col items-center gap-4 [grid-area:pick] lg:items-end lg:self-start"
        >
          <ul
            aria-label={popular.pickLabel}
            className="grid w-full max-w-sm grid-cols-4 gap-2 sm:gap-3"
          >
            {drinks.map((drink, drinkIndex) => {
              const selected = drinkIndex === index;
              return (
                <li key={drink.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-label={drink.name}
                    onClick={() => pick(drinkIndex)}
                    className={cn(
                      "group/card relative flex aspect-square w-full cursor-pointer items-end justify-center overflow-hidden rounded-2xl border bg-cream/[0.03] px-2 pt-2 transition-[border-color,background-color,translate,box-shadow,scale] duration-500 hover:-translate-y-1.5 hover:border-copper/60 hover:shadow-[0_20px_40px_-20px] hover:shadow-copper/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copper active:scale-95 lg:aspect-[3/4]",
                      selected
                        ? "border-copper/80 bg-copper/10 shadow-[0_16px_36px_-18px] shadow-copper/60"
                        : "border-cream/10",
                    )}
                  >
                    <Image
                      src={drink.image.src}
                      alt=""
                      width={468}
                      height={1159}
                      sizes="96px"
                      className="h-[88%] w-auto max-w-full object-contain object-bottom transition-transform duration-500 group-hover/card:scale-110"
                    />
                    {/* Полоса до смены напитка — только для мыши: на телефоне
                        автосмена подменила бы напиток прямо под пальцем. */}
                    {selected && autoplay && (
                      <span
                        key={`${drink.id}-progress`}
                        aria-hidden="true"
                        onAnimationEnd={() =>
                          setIndex((current) => (current + 1) % drinks.length)
                        }
                        style={{
                          animationDuration: `${POPULAR_AUTOPLAY_MS}ms`,
                        }}
                        className={cn(
                          "absolute inset-x-0 bottom-0 hidden h-0.5 origin-left scale-x-0 bg-copper group-hover/popular:[animation-play-state:paused] motion-safe:animate-[popular-progress_linear_both] pointer-fine:block",
                          !inView && "[animation-play-state:paused]",
                        )}
                      />
                    )}
                  </button>
                  <p
                    className={cn(
                      "mt-2 truncate text-center text-[0.6875rem] transition-colors sm:text-xs",
                      selected ? "text-cream" : "text-cream/50",
                    )}
                  >
                    {drink.name}
                  </p>
                </li>
              );
            })}
          </ul>

          <p
            aria-hidden="true"
            className="hidden font-heading text-sm tracking-[0.3em] text-cream/40 lg:block"
          >
            <span className="text-copper">
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            / {String(drinks.length).padStart(2, "0")}
          </p>
        </div>
      </div>
    </div>
  );
}

// Появление при прокрутке, параллакс и наклон стакана за курсором.
function setupShowcaseMotion(root: HTMLElement, finePointer: boolean) {
  const cup = root.querySelector<HTMLElement>("[data-popular-cup]");
  const word = root.querySelector<HTMLElement>("[data-popular-word]");

  gsap.from(root.querySelectorAll("[data-popular-reveal]"), {
    autoAlpha: 0,
    y: 48,
    duration: 1.1,
    stagger: 0.15,
    ease: "expo.out",
    scrollTrigger: { trigger: root, start: "top 70%", once: true },
  });
  if (cup) {
    gsap.from(cup, {
      autoAlpha: 0,
      yPercent: 18,
      scale: 0.9,
      duration: 1.4,
      ease: "expo.out",
      scrollTrigger: { trigger: root, start: "top 75%", once: true },
    });
  }

  // Вывеска на фоне медленно едет вбок — глубина студии.
  const scroll = {
    trigger: root,
    start: "top bottom",
    end: "bottom top",
    scrub: true,
  };
  if (word) {
    gsap.fromTo(
      word,
      { xPercent: -4 },
      { xPercent: -28, ease: "none", scrollTrigger: scroll },
    );
  }

  if (!finePointer || !cup) return;

  // Наклон стакана за курсором — только для мыши.
  const tiltY = gsap.quickTo(cup, "rotationY", {
    duration: 0.8,
    ease: "power3.out",
  });
  const tiltX = gsap.quickTo(cup, "rotationX", {
    duration: 0.8,
    ease: "power3.out",
  });
  const onMove = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    const dx = (event.clientX - rect.left) / rect.width - 0.5;
    const dy = (event.clientY - rect.top) / rect.height - 0.5;
    tiltY(dx * 14);
    tiltX(-dy * 8);
  };
  const onLeave = () => {
    tiltY(0);
    tiltX(0);
  };
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);
  const releaseMagnetic = magnetic(root, "[data-popular-magnetic]");

  return () => {
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    releaseMagnetic();
  };
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
      <p className="max-w-xl font-heading text-[clamp(1.75rem,4vw,3rem)] leading-tight">
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
