"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

// Карусель на нативной прокрутке с привязкой к кадру: свайп на телефоне,
// стрелки и точки — для мыши и клавиатуры. Один кадр — без стрелок и точек.
export function Carousel({
  slides,
  label,
  className,
}: {
  slides: ReactNode[];
  label: string;
  className?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const many = slides.length > 1;

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(slides.length - 1, next));
    track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
  };

  return (
    <div
      role="region"
      aria-roledescription="карусель"
      aria-label={label}
      className={cn("group/carousel relative", className)}
    >
      <div
        ref={trackRef}
        onScroll={(event) => {
          const track = event.currentTarget;
          setIndex(Math.round(track.scrollLeft / track.clientWidth));
        }}
        className="flex size-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain"
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            role="group"
            aria-roledescription="кадр"
            aria-label={`${slideIndex + 1} из ${slides.length}`}
            className="relative size-full shrink-0 snap-center"
          >
            {slide}
          </div>
        ))}
      </div>

      {many && (
        <>
          <CarouselArrow
            side="left"
            hidden={index === 0}
            onClick={() => goTo(index - 1)}
          />
          <CarouselArrow
            side="right"
            hidden={index === slides.length - 1}
            onClick={() => goTo(index + 1)}
          />
          {/* Подложка: светлые точки должны читаться и на светлом фото. */}
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 rounded-full bg-charcoal/45 px-1 backdrop-blur-sm">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                type="button"
                aria-label={`Фото ${dotIndex + 1}`}
                aria-current={dotIndex === index}
                onClick={() => goTo(dotIndex)}
                // Точка маленькая, тач-цель — 24 px вокруг неё.
                className="flex size-6 items-center justify-center"
              >
                <span
                  className={cn(
                    "block h-1.5 rounded-full bg-cream shadow transition-all",
                    dotIndex === index ? "w-4" : "w-1.5 opacity-60",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CarouselArrow({
  side,
  hidden,
  onClick,
}: {
  side: "left" | "right";
  hidden: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Предыдущее фото" : "Следующее фото"}
      onClick={onClick}
      tabIndex={hidden ? -1 : 0}
      className={cn(
        // На тач-экране листают свайпом — стрелки только для мыши и клавиатуры.
        "absolute top-1/2 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-charcoal/55 text-cream transition-opacity pointer-fine:flex",
        side === "left" ? "left-2" : "right-2",
        hidden && "pointer-events-none opacity-0",
      )}
    >
      <Icon aria-hidden="true" />
    </button>
  );
}
