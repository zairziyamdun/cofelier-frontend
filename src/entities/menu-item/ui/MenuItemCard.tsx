import type { ReactNode } from "react";

import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";

import type { MenuItem } from "../model/types";

import { MenuItemBadges } from "./MenuItemBadges";
import { MenuPhotoImage } from "./MenuPhotoImage";

// Телефон — строка: обложка слева, справа название, цена и кнопка. С sm — карточка
// с обложкой сверху. Касание по фото или названию — onOpen (шторка товара);
// action — слот под кнопку из слоя выше: сущность меню не знает о корзине.
export function MenuItemCard({
  item,
  action,
  onOpen,
}: {
  item: MenuItem;
  action?: ReactNode;
  onOpen?: () => void;
}) {
  const cover = item.photos[0];
  const photoCount = item.photos.length;

  return (
    <article
      className={cn(
        "grid grid-cols-[5.5rem_1fr] gap-x-4 gap-y-2 rounded-xl border border-border bg-card p-3 text-card-foreground sm:flex sm:flex-col sm:p-0",
        !item.isAvailable && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Подробнее: ${item.name}`}
        className="relative row-span-2 aspect-square w-full self-start overflow-hidden rounded-lg sm:aspect-[4/5] sm:rounded-none sm:rounded-t-xl"
      >
        <MenuPhotoImage
          photo={cover}
          alt={item.name}
          // Строка на телефоне — 88 px; с sm — карточка в 2–3 колонки.
          sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 5.5rem"
          className="transition-transform duration-500 hover:scale-[1.03]"
        />
        {photoCount > 1 && (
          <span className="absolute right-1.5 bottom-1.5 rounded-full bg-charcoal/70 px-1.5 text-[0.6875rem] leading-5 text-cream">
            1/{photoCount}
          </span>
        )}
      </button>

      <div className="flex min-w-0 flex-col gap-1 sm:px-4 sm:pt-2">
        <MenuItemBadges badges={item.badges} />
        <button
          type="button"
          onClick={onOpen}
          className="text-left font-heading text-lg leading-snug sm:text-xl"
        >
          {item.name}
        </button>
        {item.description && (
          <p className="line-clamp-1 text-sm text-muted-foreground sm:line-clamp-2">
            {item.description}
          </p>
        )}
      </div>

      <div className="col-start-2 mt-auto flex min-h-11 flex-wrap items-center justify-between gap-2 text-sm sm:px-4 sm:pb-4">
        <span className="flex items-baseline gap-2">
          <span className="font-semibold text-copper">
            {formatPrice(item.price)}
          </span>
          {item.portion && (
            <span className="text-muted-foreground">{item.portion}</span>
          )}
        </span>
        {item.isAvailable ? (
          action
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Нет в наличии
          </span>
        )}
      </div>
    </article>
  );
}
