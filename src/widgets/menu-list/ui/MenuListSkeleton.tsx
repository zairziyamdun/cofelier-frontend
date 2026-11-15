const placeholderCards = Array.from({ length: 6 }, (_, index) => index);

export function MenuListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загружаем меню"
      className="flex animate-pulse flex-col gap-8"
    >
      <div className="flex gap-2">
        <div className="h-11 w-32 rounded-full bg-muted" />
        <div className="h-11 w-28 rounded-full bg-muted" />
        <div className="h-11 w-36 rounded-full bg-muted" />
      </div>
      <div className="h-8 w-56 rounded-lg bg-muted" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {placeholderCards.map((index) => (
          <div key={index} className="h-32 rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}
