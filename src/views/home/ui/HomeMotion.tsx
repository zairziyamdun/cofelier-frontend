"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { MOTION_OK, useGSAP } from "@/shared/lib/gsap";

import { BEAN_MODEL_URL, MODELS, type ModelKey } from "../config/scene";
import { setupHomeMotion } from "../lib/home-motion";
import { whenIdle } from "../lib/when-idle";

type NetworkInformation = { saveData?: boolean };

// Клиентская оболочка главной: секции рендерятся на сервере,
// а здесь на них навешиваются анимации; useGSAP сам всё снимает при уходе.
export function HomeMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (ref.current) setupHomeMotion(ref.current);
    },
    { scope: ref },
  );

  // Общая 3D-сцена: Three.js грузится отдельным чанком, когда поток свободен.
  useEffect(() => {
    const root = ref.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    const slots = Array.from(
      root.querySelectorAll<HTMLElement>("[data-model-slot]"),
    );
    const connection = (navigator as { connection?: NetworkInformation })
      .connection;
    if (!slots.length || connection?.saveData) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;
    const start = () =>
      import("../lib/story-scene")
        .then(({ StoryScene }) => {
          if (cancelled) return;
          // Холст создаём на каждый запуск эффекта: после dispose его
          // WebGL-контекст потерян, и повторный монтаж на нём не рисует.
          const canvas = document.createElement("canvas");
          canvas.className = "block";
          stage.append(canvas);
          try {
            const scene = new StoryScene(
              canvas,
              window.matchMedia(MOTION_OK).matches,
            );
            for (const slot of slots) {
              const model = MODELS[slot.dataset.modelSlot as ModelKey];
              if (model) scene.add(slot, model);
            }
            scene.loadBeans(BEAN_MODEL_URL);
            cleanup = () => {
              scene.dispose();
              canvas.remove();
            };
          } catch {
            // Нет WebGL — страница остаётся без моделей.
            canvas.remove();
          }
        })
        .catch(() => undefined);
    // Сцену создаём, когда до первого предмета остаётся экран: при
    // обновлении наверху её запуск не толкается с загрузкой hero.
    let cancelIdle: (() => void) | undefined;
    const near = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        near.disconnect();
        cancelIdle = whenIdle(start, 1500);
      },
      { rootMargin: "100% 0px" },
    );
    for (const slot of slots) near.observe(slot);

    return () => {
      cancelled = true;
      near.disconnect();
      cancelIdle?.();
      cleanup?.();
    };
  }, []);

  return (
    // dark: вся главная — одна тёмная студия, токены shadcn берутся тёмные.
    <main
      ref={ref}
      className="dark relative isolate flex-1 bg-background text-foreground"
    >
      {/* Общий фон-студия: прилипает к экрану, секции над ним прозрачные. */}
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 -z-10 -mb-[100lvh] h-lvh overflow-hidden"
      >
        <div data-studio-key className="studio-key" />
        <div data-studio-fill className="studio-fill" />
        <div className="absolute inset-0 studio-vignette" />
        <div className="absolute inset-0 grain" />
      </div>
      {/* Слой 3D-сцены: поверх секций, чтобы зёрна летели между карточками;
          холст в нём сам встаёт на прокрутку (lib/story-scene). */}
      <div
        ref={stageRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-10"
      />
      {children}
    </main>
  );
}
