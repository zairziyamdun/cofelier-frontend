"use client";

import { Plus } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { addToCart, useCart } from "../model/cart-store";
import { QuantityStepper } from "./QuantityStepper";

type AddToCartButtonProps = {
  menuItemId: number;
  name: string;
  price: number;
  className?: string;
};

// Пока позиции нет в корзине — кнопка, потом — счётчик количества.
export function AddToCartButton({
  menuItemId,
  name,
  price,
  className,
}: AddToCartButtonProps) {
  const cart = useCart();
  const line = cart?.find((item) => item.menuItemId === menuItemId);

  if (line) {
    return (
      <QuantityStepper
        menuItemId={menuItemId}
        name={name}
        quantity={line.quantity}
      />
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      className={cn("min-h-11 px-4", className)}
      aria-label={`Добавить «${name}» в корзину`}
      // До загрузки корзины кнопка видна, но неактивна: нет мигания на гидратации.
      disabled={cart === null}
      onClick={() => addToCart({ menuItemId, name, price })}
    >
      <Plus aria-hidden="true" />В корзину
    </Button>
  );
}
