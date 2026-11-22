"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";

import {
  type MenuItem,
  MenuItemBadges,
  MenuPhotoImage,
} from "@/entities/menu-item";
import { AddToCartButton } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { Carousel } from "@/shared/ui/carousel";
import { Dialog } from "@/shared/ui/dialog";

const PHOTO_SIZES = "(min-width: 640px) 32rem, 100vw";

// Шторка товара: фото каруселью, описание и кнопка корзины внизу на виду.
export function ProductSheet({
  item,
  onClose,
}: {
  item: MenuItem | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={item !== null}
      onClose={onClose}
      title={item?.name ?? "Товар"}
      variant="sheet"
    >
      {item && <ProductSheetContent item={item} onClose={onClose} />}
    </Dialog>
  );
}

function ProductSheetContent({
  item,
  onClose,
}: {
  item: MenuItem;
  onClose: () => void;
}) {
  const slides =
    item.photos.length > 0
      ? item.photos.map((photo, index) => (
          <MenuPhotoImage
            key={photo.id}
            photo={photo}
            alt={index === 0 ? item.name : `${item.name}, фото ${index + 1}`}
            sizes={PHOTO_SIZES}
            priority={index === 0}
          />
        ))
      : [<MenuPhotoImage key="none" photo={undefined} alt="" sizes="" />];

  return (
    <div className="flex flex-col">
      <div className="relative">
        <Carousel
          slides={slides}
          label={`Фото: ${item.name}`}
          // Фото не выше половины экрана: название, цена и кнопка видны сразу.
          className="aspect-[4/5] max-h-[55dvh] w-full overflow-hidden"
        />
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-charcoal/60 text-cream"
        >
          <X aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col gap-3 px-4 pt-4 pb-2 sm:px-6">
        <MenuItemBadges badges={item.badges} />
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-heading text-2xl leading-tight">{item.name}</h2>
          <span className="shrink-0 text-lg font-semibold text-copper">
            {formatPrice(item.price)}
          </span>
        </div>
        {item.portion && (
          <p className="text-sm text-muted-foreground">{item.portion}</p>
        )}
        {item.description && <p>{item.description}</p>}
      </div>

      {/* Кнопка липкая: при длинном описании она не уезжает за край экрана. */}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-card px-4 py-3 sm:px-6">
        {item.isAvailable ? (
          <>
            <AddToCartButton
              menuItemId={item.id}
              name={item.name}
              price={item.price}
              label={`Добавить · ${formatPrice(item.price)}`}
              className="min-h-12 flex-1 rounded-full border-copper bg-copper text-base text-charcoal hover:bg-copper/85 hover:text-charcoal dark:border-copper dark:bg-copper dark:hover:bg-copper/85"
            />
            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "min-h-12 rounded-full px-4",
              )}
            >
              Корзина
              <ArrowRight aria-hidden="true" />
            </Link>
          </>
        ) : (
          <p className="w-full rounded-full bg-muted px-4 py-3 text-center text-muted-foreground">
            Сейчас нет в наличии
          </p>
        )}
      </div>
    </div>
  );
}
