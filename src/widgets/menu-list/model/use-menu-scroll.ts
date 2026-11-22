"use client";

import { useEffect, useState } from "react";

// Высота липкой шапки сайта: на телефоне она в две строки и зависит от
// ширины экрана — меряем, а не угадываем.
export function useHeaderHeight(): number {
  const [height, setHeight] = useState(0);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const update = () => setHeight(header.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  return height;
}

// Раздел меню, который сейчас под липкой полосой: последний, чей верх уже
// прошёл её нижний край. Считаем по прокрутке — без лишних наблюдателей на
// каждый раздел.
export function useActiveSection(
  slugs: string[],
  topOffset: number,
): string | null {
  const [active, setActive] = useState<string | null>(slugs[0] ?? null);
  const key = slugs.join("|");

  useEffect(() => {
    const ids = key ? key.split("|") : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0] ?? null;
      for (const id of ids) {
        const section = document.getElementById(id);
        if (section && section.getBoundingClientRect().top <= topOffset + 16) {
          current = id;
        }
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key, topOffset]);

  return active;
}
