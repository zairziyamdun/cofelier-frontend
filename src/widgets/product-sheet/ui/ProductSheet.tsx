"use client";

import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";

import {
  defaultSelection,
  type MenuItem,
  MenuItemBadges,
  MenuPhotoImage,
  type Selection,
  selectedModifiers,
  selectionErrors,
  selectionPrice,
} from "@/entities/menu-item";
import { addToCart } from "@/features/cart";
import { formatPrice } from "@/shared/lib/format-price";
import { Button } from "@/shared/ui/button";
import { Carousel } from "@/shared/ui/carousel";
import { Dialog } from "@/shared/ui/dialog";

import { ModifierPicker } from "./ModifierPicker";

const PHOTO_SIZES = "(min-width: 640px) 32rem, 100vw";
const MAX_SHEET_QUANTITY = 20;
const NO_ERRORS: ReadonlyMap<number, string> = new Map();

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
      {/* key — новый товар начинает с чистого выбора добавок. */}
      {item && (
        <ProductSheetContent key={item.id} item={item} onClose={onClose} />
      )}
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
  const [selection, setSelection] = useState<Selection>(() =>
    defaultSelection(item),
  );
  const [quantity, setQuantity] = useState(1);
  // Ошибки групп — только после попытки добавить: не ругаемся раньше времени.
  const [showErrors, setShowErrors] = useState(false);
  const unitPrice = selectionPrice(item, selection);
  const errors = new Map(
    selectionErrors(item, selection).map(({ groupId, error }) => [
      groupId,
      error,
    ]),
  );

  const add = () => {
    if (errors.size > 0) {
      setShowErrors(true);
      return;
    }
    addToCart(
      {
        menuItemId: item.id,
        name: item.name,
        price: unitPrice,
        modifiers: selectedModifiers(item, selection),
      },
      quantity,
    );
    onClose();
  };

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
            {formatPrice(unitPrice)}
          </span>
        </div>
        {item.portion && (
          <p className="text-sm text-muted-foreground">{item.portion}</p>
        )}
        {item.description && <p>{item.description}</p>}
      </div>

      {item.isAvailable && item.modifierGroups.length > 0 && (
        <div className="border-t border-border px-4 py-4 sm:px-6">
          <ModifierPicker
            groups={item.modifierGroups}
            selection={selection}
            errors={showErrors ? errors : NO_ERRORS}
            onChange={setSelection}
          />
        </div>
      )}

      {/* Кнопка липкая: при длинном описании она не уезжает за край экрана. */}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t border-border bg-card px-4 py-3 sm:px-6">
        {item.isAvailable ? (
          <>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 rounded-full"
                aria-label="Меньше"
                disabled={quantity <= 1}
                onClick={() => setQuantity((value) => value - 1)}
              >
                <Minus aria-hidden="true" />
              </Button>
              <span
                aria-live="polite"
                aria-label={`Количество: ${quantity}`}
                className="w-8 text-center font-medium tabular-nums"
              >
                {quantity}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-11 rounded-full"
                aria-label="Больше"
                disabled={quantity >= MAX_SHEET_QUANTITY}
                onClick={() => setQuantity((value) => value + 1)}
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
            <Button
              type="button"
              className="min-h-12 flex-1 rounded-full bg-copper text-base text-charcoal hover:bg-copper/85"
              onClick={add}
            >
              Добавить · {formatPrice(unitPrice * quantity)}
            </Button>
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
