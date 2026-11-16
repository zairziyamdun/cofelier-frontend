"use client";

import { useEffect, useRef, useState } from "react";

import { MOTION_OK, ScrollTrigger } from "@/shared/lib/gsap";
import { cn } from "@/shared/lib/utils";

import { BEAN_COUNT, BEAN_MODEL_URL } from "../config/scene";
import { BeanField } from "../lib/bean-field";

type NetworkInformation = { saveData?: boolean };

// Холст с зёрнами на всю площадь hero. Чисто декоративный: без WebGL,
// в режиме экономии трафика или при ошибке загрузки hero остаётся без 3D.
export default function BeanScene() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const connection = (navigator as { connection?: NetworkInformation })
      .connection;
    if (connection?.saveData) return;

    const motion = window.matchMedia(MOTION_OK).matches;
    const wide = window.matchMedia("(min-width: 768px)").matches;

    // Холст создаём на каждый запуск эффекта: после dispose его WebGL-контекст
    // потерян навсегда, и повторный монтаж (StrictMode) на том же холсте не рисует.
    const canvas = document.createElement("canvas");
    canvas.className = "block size-full";
    wrap.append(canvas);

    let field: BeanField;
    try {
      field = new BeanField(canvas, {
        count: wide ? BEAN_COUNT.desktop : BEAN_COUNT.mobile,
        layout: wide ? "side" : "center",
        fogColor: getComputedStyle(wrap).getPropertyValue("--charcoal").trim(),
      });
    } catch {
      canvas.remove();
      return;
    }
    field.setAnimated(motion);

    const resize = () => field.resize(wrap.clientWidth, wrap.clientHeight);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    resize();

    // Рисуем, только пока hero на экране и вкладка активна.
    let inView = true;
    const sync = () => {
      if (inView && !document.hidden) field.start();
      else field.stop();
    };
    const viewObserver = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    viewObserver.observe(wrap);
    document.addEventListener("visibilitychange", sync);

    const onPointer = (event: PointerEvent) =>
      field.setPointer(
        (event.clientX / window.innerWidth) * 2 - 1,
        (event.clientY / window.innerHeight) * 2 - 1,
      );
    if (motion)
      window.addEventListener("pointermove", onPointer, { passive: true });

    const trigger = motion
      ? ScrollTrigger.create({
          trigger: wrap,
          start: "top top",
          end: "bottom top",
          onUpdate: (self) => field.setScroll(self.progress),
        })
      : undefined;

    let cancelled = false;
    field
      .load(BEAN_MODEL_URL)
      .then(() => {
        if (cancelled) return;
        resize();
        sync();
        setReady(true);
      })
      // Сцена — украшение: без модели hero просто остаётся с градиентом.
      .catch(() => undefined);

    return () => {
      cancelled = true;
      trigger?.kill();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", sync);
      viewObserver.disconnect();
      resizeObserver.disconnect();
      field.dispose();
      canvas.remove();
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-[1600ms] ease-out",
        ready && "opacity-100",
      )}
    />
  );
}
