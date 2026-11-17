import { gsap, MOTION_OK, ScrollTrigger, SplitText } from "@/shared/lib/gsap";

import { markHeroIntroDone } from "./hero-intro";

// Анимации главной. Разметка серверная и размечена data-атрибутами;
// здесь только поведение. Без JS и при prefers-reduced-motion всё видно сразу.

const all = (root: ParentNode, selector: string) =>
  gsap.utils.toArray<HTMLElement>(root.querySelectorAll(selector));

export function setupHomeMotion(root: HTMLElement) {
  const mm = gsap.matchMedia();

  mm.add(
    {
      motion: MOTION_OK,
      desktop: "(min-width: 768px)",
      finePointer: "(hover: hover) and (pointer: fine)",
    },
    (context) => {
      const { motion, desktop, finePointer } =
        context.conditions as gsap.Conditions;
      const hero = root.querySelector<HTMLElement>("[data-hero]");
      if (!motion) {
        // Без анимаций интро нет — 3D-сцене hero ждать нечего.
        if (hero) markHeroIntroDone(hero);
        return;
      }

      studioLights(root);
      heroIntro(root);
      heroOutro(root);
      splitHeadings(root);
      manifesto(root);
      counters(root);
      journey(root, Boolean(desktop));
      marquee(root);
      reveals(root);
      orderLine(root);
      return finePointer ? magnetic(root) : undefined;
    },
  );

  return mm;
}

// Заголовок собирается по буквам из-под маски, остальное — следом.
function heroIntro(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  const title = hero?.querySelector<HTMLElement>("[data-hero-title]");
  if (!hero || !title) {
    if (hero) markHeroIntroDone(hero);
    return;
  }

  // Скелетон текста (globals.css) уходит, как только интро готово начаться.
  hero.setAttribute("data-hero-started", "");
  const fades = all(root, "[data-hero-fade]");
  gsap.set(fades, { autoAlpha: 0, y: 32 });

  SplitText.create(title, {
    type: "lines,words,chars",
    mask: "lines",
    autoSplit: true,
    onSplit(self) {
      gsap.set(title, { autoAlpha: 1 });
      // 3D-сцена стартует после интро: её запуск блокирует поток
      // на сотни мс, и буквы в это время шли бы рывками.
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => markHeroIntroDone(hero),
      });
      tl.from(self.chars, {
        yPercent: 120,
        rotate: 8,
        duration: 1.3,
        stagger: 0.03,
        delay: 0.15,
      }).to(
        fades,
        { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.12 },
        "-=0.9",
      );
      return tl;
    },
  });
}

// Свет студии переезжает от секции к секции: фон один на всю страницу,
// а меняется только то, откуда «светят» два источника.
function studioLights(root: HTMLElement) {
  const key = root.querySelector("[data-studio-key]");
  const fill = root.querySelector("[data-studio-fill]");
  if (!key || !fill) return;

  // Точки пути — сдвиг от исходного места (hero: свет справа, за зерном).
  const keyPath = [
    { x: "-52vw", y: "12vh" },
    { x: "-8vw", y: "-22vh" },
    { x: "-58vw", y: "4vh" },
    { x: "6vw", y: "14vh" },
    { x: "-28vw", y: "34vh" },
  ];
  const fillPath = [
    { x: "70vw", y: "-50vh" },
    { x: "20vw", y: "0vh" },
    { x: "76vw", y: "-30vh" },
    { x: "10vw", y: "-10vh" },
    { x: "38vw", y: "-60vh" },
  ];

  const timeline = gsap.timeline({
    defaults: { ease: "sine.inOut" },
    scrollTrigger: {
      trigger: root,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
    },
  });
  keyPath.forEach((point, index) => {
    timeline.to(key, { ...point, duration: 1 }, index);
    timeline.to(fill, { ...fillPath[index], duration: 1 }, index);
  });
}

// При уходе hero текст поднимается и гаснет.
function heroOutro(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  const content = hero?.querySelector("[data-hero-content]");
  if (!hero || !content) return;

  gsap.to(content, {
    yPercent: -18,
    autoAlpha: 0,
    ease: "none",
    scrollTrigger: {
      trigger: hero,
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
}

// Заголовки секций выезжают построчно из-под маски при появлении.
function splitHeadings(root: HTMLElement) {
  for (const heading of all(root, "[data-split]")) {
    SplitText.create(heading, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.2,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: { trigger: heading, start: "top 88%", once: true },
        }),
    });
  }
}

// Манифест «проявляется» слово за словом в такт прокрутке.
function manifesto(root: HTMLElement) {
  const text = root.querySelector<HTMLElement>("[data-manifesto]");
  if (!text) return;

  SplitText.create(text, {
    type: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: {
            trigger: text,
            start: "top 80%",
            end: "bottom 45%",
            scrub: true,
          },
        },
      ),
  });
}

// Счётчики: в разметке уже итоговое число, анимация идёт от нуля к нему.
function counters(root: HTMLElement) {
  for (const counter of all(root, "[data-count]")) {
    gsap.from(counter, {
      textContent: 0,
      snap: { textContent: 1 },
      duration: 1.8,
      ease: "power3.out",
      scrollTrigger: { trigger: counter, start: "top 90%", once: true },
    });
  }
}

// На широком экране секция закрепляется, а шаги едут горизонтально;
// на телефоне — обычная вертикальная лента с появлением карточек.
function journey(root: HTMLElement, desktop: boolean) {
  const section = root.querySelector<HTMLElement>("[data-journey]");
  const track = section?.querySelector<HTMLElement>("[data-journey-track]");
  if (!section || !track) return;
  const panels = all(track, "[data-journey-panel]");

  if (!desktop) {
    for (const panel of panels) {
      // Карточку с моделью не двигаем: 3D-предмет едет вместе со слотом
      // и при быстрой прокрутке дёргался бы; появляется только текст.
      const body = panel.querySelectorAll("[data-journey-body] > *");
      gsap.from(body.length ? body : panel, {
        y: 64,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.08,
        ease: "expo.out",
        scrollTrigger: { trigger: panel, start: "top 85%", once: true },
      });
    }
    return;
  }

  const distance = () => track.scrollWidth - section.clientWidth;
  const scroll = gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 1,
      // Упреждение ≈ скорость × 13 мс, около кадра: при 1 (≈ 45 мс) секция
      // на быстрой прокрутке закреплялась на 150+ px раньше и прыгала вверх.
      anticipatePin: 0.3,
      invalidateOnRefresh: true,
    },
  });

  const progress = section.querySelector("[data-journey-progress]");
  if (!progress) return;
  gsap.fromTo(
    progress,
    { scaleX: 0 },
    {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${distance()}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    },
  );

  // Внутри панели крупная цифра и иконка движутся медленнее текста — параллакс.
  for (const panel of panels) {
    const inside = { trigger: panel, containerAnimation: scroll, scrub: true };
    const num = panel.querySelector("[data-journey-num]");
    if (num) {
      gsap.fromTo(
        num,
        { xPercent: 60 },
        {
          xPercent: -30,
          ease: "none",
          scrollTrigger: { ...inside, start: "left right", end: "right left" },
        },
      );
    }
    const body = panel.querySelectorAll("[data-journey-body] > *");
    if (!body.length) continue;
    gsap.from(body, {
      y: 40,
      autoAlpha: 0,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { ...inside, start: "left 85%", end: "left 45%" },
    });
  }
}

// Бегущая строка: бесконечный цикл, ускоряется от скорости прокрутки.
function marquee(root: HTMLElement) {
  for (const band of all(root, "[data-marquee]")) {
    const row = band.querySelector<HTMLElement>("[data-marquee-row]");
    if (!row) continue;

    const loop = gsap.to(row, {
      xPercent: -50,
      ease: "none",
      duration: 36,
      repeat: -1,
    });
    const settle = gsap.quickTo(loop, "timeScale", {
      duration: 0.9,
      ease: "power3.out",
    });

    ScrollTrigger.create({
      trigger: band,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      onUpdate: (self) => {
        const boost = gsap.utils.clamp(
          1,
          6,
          1 + Math.abs(self.getVelocity()) / 350,
        );
        loop.timeScale(boost);
        settle(1);
      },
    });
  }
}

// Карточки и блоки появляются пачками — один ScrollTrigger на группу.
function reveals(root: HTMLElement) {
  const items = all(root, "[data-reveal]");
  if (!items.length) return;
  gsap.set(items, { autoAlpha: 0, y: 56 });

  ScrollTrigger.batch(items, {
    start: "top 88%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        stagger: 0.12,
        ease: "expo.out",
        overwrite: true,
      }),
  });
}

// Линия между шагами заказа «прорисовывается», шаги загораются по очереди.
function orderLine(root: HTMLElement) {
  const list = root.querySelector<HTMLElement>("[data-order]");
  const line = list?.querySelector("[data-order-line]");
  if (!list || !line) return;

  gsap.fromTo(
    line,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: "none",
      scrollTrigger: {
        trigger: list,
        start: "top 70%",
        end: "bottom 55%",
        scrub: true,
      },
    },
  );

  for (const step of all(list, "[data-order-step]")) {
    gsap.from(step, {
      autoAlpha: 0.25,
      x: 24,
      duration: 0.8,
      ease: "power3.out",
      scrollTrigger: {
        trigger: step,
        start: "top 68%",
        toggleActions: "play none none reverse",
      },
    });
  }
}

// «Магнитные» кнопки тянутся к курсору — только для мыши.
function magnetic(root: HTMLElement) {
  const cleanups = all(root, "[data-magnetic]").map((element) => {
    const toX = gsap.quickTo(element, "x", {
      duration: 0.6,
      ease: "power3.out",
    });
    const toY = gsap.quickTo(element, "y", {
      duration: 0.6,
      ease: "power3.out",
    });

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      toX((event.clientX - rect.left - rect.width / 2) * 0.35);
      toY((event.clientY - rect.top - rect.height / 2) * 0.35);
    };
    const onLeave = () => {
      toX(0);
      toY(0);
    };

    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
    };
  });

  return () => cleanups.forEach((cleanup) => cleanup());
}
