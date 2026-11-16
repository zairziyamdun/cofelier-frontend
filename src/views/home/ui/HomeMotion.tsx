"use client";

import { useRef, type ReactNode } from "react";

import { useGSAP } from "@/shared/lib/gsap";

import { setupHomeMotion } from "../lib/home-motion";

// Клиентская оболочка главной: секции рендерятся на сервере,
// а здесь на них навешиваются анимации; useGSAP сам всё снимает при уходе.
export function HomeMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (ref.current) setupHomeMotion(ref.current);
    },
    { scope: ref },
  );

  return (
    <main ref={ref} className="flex-1">
      {children}
    </main>
  );
}
