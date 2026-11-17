"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";

import { afterHeroIntro } from "../lib/hero-intro";
import { whenIdle } from "../lib/when-idle";

// Three.js (~150 КБ gzip) грузится отдельным чанком только в браузере
// и только после интро hero: текст анимируется, не делясь потоком с 3D.
const BeanScene = dynamic(() => import("./BeanScene"), { ssr: false });

export function BeanSceneLazy() {
  const ref = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hero = ref.current?.closest<HTMLElement>("[data-hero]");
    if (!hero) return;
    let cancelIdle: (() => void) | undefined;
    const cancelWait = afterHeroIntro(hero, () => {
      cancelIdle = whenIdle(() => setStart(true), 500);
    });
    return () => {
      cancelWait();
      cancelIdle?.();
    };
  }, []);

  return (
    <>
      {/* Скелетон зерна: мягкое медное свечение там, где оно появится,
          пока сцена ждёт конца интро и грузит модель. */}
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-[66%] left-[62%] size-[72vw] max-w-[28rem] -translate-1/2 transition-opacity duration-[1600ms] md:top-1/2 md:left-[70%] md:size-[34vw] md:max-w-[32rem]",
          ready && "opacity-0",
        )}
      >
        <div className="size-full rounded-full bg-radial from-copper/25 via-copper/5 to-transparent to-70% motion-safe:animate-[bean-skeleton_2.4s_ease-in-out_infinite]" />
      </div>
      {start && <BeanScene onReady={() => setReady(true)} />}
    </>
  );
}
