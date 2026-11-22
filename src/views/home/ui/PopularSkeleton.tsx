import { popular } from "../config/content";

const cards = [0, 1, 2, 3];

// Та же высота, что у ленты: подгрузка не сдвигает страницу и не сбивает
// расчёты ScrollTrigger у секций ниже.
export function PopularSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загружаем популярные напитки"
      className="mx-auto flex max-w-7xl flex-col gap-6 overflow-hidden px-4 py-16 sm:py-24"
    >
      <div className="flex flex-col gap-2">
        <h2
          id="popular-title"
          className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
        >
          {popular.eyebrow}
        </h2>
        <div className="h-12 w-3/4 max-w-md animate-pulse rounded-xl bg-cream/5" />
      </div>
      <div className="flex gap-4">
        {cards.map((card) => (
          <div
            key={card}
            className="flex w-[min(78vw,18rem)] shrink-0 flex-col gap-3"
          >
            <div className="aspect-[4/5] animate-pulse rounded-2xl bg-cream/5" />
            <div className="h-6 w-2/3 animate-pulse rounded-lg bg-cream/5" />
            <div className="h-11 animate-pulse rounded-full bg-cream/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
