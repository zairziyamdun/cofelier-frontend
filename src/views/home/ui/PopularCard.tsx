import {
  type MenuItem,
  MenuItemBadges,
  MenuPhotoImage,
} from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";

// Карточка ленты. Номер — место в рейтинге заказов; фото чуть шире рамки,
// и лента сдвигает его при прокрутке (--shift), так появляется глубина.
export function PopularCard({
  item,
  rank,
  active,
  onOpen,
}: {
  item: MenuItem;
  rank: number;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-cream/[0.04] text-cream transition-colors duration-500",
        active ? "border-copper/60" : "border-cream/10",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Подробнее: ${item.name}`}
        className="group relative aspect-square w-full overflow-hidden"
      >
        <span
          data-popular-photo
          className="absolute -inset-x-6 inset-y-0 block transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
          style={{ transform: "translateX(var(--shift, 0px))" }}
        >
          <MenuPhotoImage
            photo={item.photos[0]}
            alt={item.name}
            sizes="(min-width: 640px) 16rem, 72vw"
          />
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-charcoal/80 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-1 left-4 font-heading text-5xl leading-none text-outline"
        >
          {String(rank).padStart(2, "0")}
        </span>
      </button>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <MenuItemBadges badges={item.badges} tone="dark" />
        <button
          type="button"
          onClick={onOpen}
          className="text-left font-heading text-xl leading-snug"
        >
          {item.name}
        </button>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-lg font-semibold text-copper">
            {formatPrice(item.defaultPrice ?? item.price)}
          </span>
          <AddToCartButton
            item={item}
            onChoose={onOpen}
            className="rounded-full border-copper bg-copper text-charcoal hover:bg-copper/85 hover:text-charcoal dark:border-copper dark:bg-copper dark:hover:bg-copper/85"
          />
        </div>
      </div>
    </article>
  );
}
