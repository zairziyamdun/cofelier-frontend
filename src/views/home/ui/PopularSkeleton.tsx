import { popular } from "../config/content";
import { POPULAR_SHOWN } from "../config/drinks";

const cards = Array.from({ length: POPULAR_SHOWN }, (_, index) => index);

// Та же сетка и высота, что у витрины: подгрузка не сдвигает страницу
// и не сбивает расчёты ScrollTrigger у секций ниже.
export function PopularSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загружаем популярные напитки"
      className="mx-auto grid max-w-7xl gap-10 px-4 py-24 lg:min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)_minmax(0,1fr)] lg:items-center lg:gap-8"
    >
      <div className="flex flex-col gap-6">
        <h2
          id="popular-title"
          className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
        >
          {popular.eyebrow}
        </h2>
        <div className="h-24 w-4/5 animate-pulse rounded-2xl bg-cream/5" />
        <div className="h-12 w-3/5 animate-pulse rounded-xl bg-cream/5" />
        <div className="h-12 w-40 animate-pulse rounded-full bg-cream/5" />
      </div>
      <div className="mx-auto h-[clamp(11rem,34svh,20rem)] w-[min(80vw,20rem)] animate-pulse rounded-[3rem] bg-cream/5 lg:h-[clamp(20rem,60vh,38rem)] lg:w-[min(19rem,30vh)]" />
      <div className="flex flex-col gap-6 lg:items-end">
        <div className="h-10 w-3/4 animate-pulse rounded-xl bg-cream/5" />
        <div className="grid w-full max-w-sm grid-cols-4 gap-3">
          {cards.map((card) => (
            <div
              key={card}
              className="aspect-[3/4] animate-pulse rounded-2xl bg-cream/5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
