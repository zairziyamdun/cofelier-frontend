"use client";

import { Minus, Plus } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { MAX_QUANTITY, setQuantity } from "../model/cart-store";

export function QuantityStepper({
  menuItemId,
  name,
  quantity,
}: {
  menuItemId: number;
  name: string;
  quantity: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={`Убрать одну «${name}»`}
        onClick={() => setQuantity(menuItemId, quantity - 1)}
      >
        <Minus aria-hidden="true" />
      </Button>
      <span
        className="w-8 text-center font-medium tabular-nums"
        aria-live="polite"
        aria-label={`${name}: ${quantity} шт.`}
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11"
        aria-label={`Добавить ещё «${name}»`}
        disabled={quantity >= MAX_QUANTITY}
        onClick={() => setQuantity(menuItemId, quantity + 1)}
      >
        <Plus aria-hidden="true" />
      </Button>
    </div>
  );
}
