"use client";

import { Plus, SlidersHorizontal } from "lucide-react";

import {
  defaultSelection,
  type MenuItem,
  selectedModifiers,
} from "@/entities/menu-item";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { addToCart, lineKey, useCart } from "../model/cart-store";
import { QuantityStepper } from "./QuantityStepper";

type AddToCartButtonProps = {
  item: MenuItem;
  // Обязательный выбор без варианта по умолчанию: «+» не может решить за гостя —
  // кнопка «Выбрать» открывает шторку товара.
  onChoose?: () => void;
  className?: string;
  // Подпись кнопки; по умолчанию — «В корзину».
  label?: string;
};

// «+» в меню: товар с добавками по умолчанию одним касанием. Пока такой строки
// нет в корзине — кнопка, потом — счётчик именно этой строки.
export function AddToCartButton({
  item,
  onChoose,
  className,
  label = "В корзину",
}: AddToCartButtonProps) {
  const cart = useCart();

  if (item.defaultPrice === null) {
    return (
      <Button
        type="button"
        variant="outline"
        className={cn("min-h-11 px-4", className)}
        aria-label={`Выбрать добавки для «${item.name}»`}
        disabled={!onChoose}
        onClick={onChoose}
      >
        <SlidersHorizontal aria-hidden="true" />
        Выбрать
      </Button>
    );
  }

  const modifiers = selectedModifiers(item, defaultSelection(item));
  const key = lineKey(item.id, modifiers);
  const line = cart?.find((candidate) => candidate.key === key);

  if (line) {
    return (
      <QuantityStepper
        lineKey={key}
        name={item.name}
        quantity={line.quantity}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("min-h-11 px-4", className)}
      aria-label={`Добавить «${item.name}» в корзину`}
      // До загрузки корзины кнопка видна, но неактивна: нет мигания на гидратации.
      disabled={cart === null}
      onClick={() =>
        addToCart({
          menuItemId: item.id,
          name: item.name,
          price: item.defaultPrice ?? item.price,
          modifiers,
        })
      }
    >
      <Plus aria-hidden="true" />
      {label}
    </Button>
  );
}
