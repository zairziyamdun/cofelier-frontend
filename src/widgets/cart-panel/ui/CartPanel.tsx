"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  cartTotal,
  clearCart,
  QuantityStepper,
  setQuantity,
  useCart,
} from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

export function CartPanel() {
  const cart = useCart();
  const router = useRouter();

  if (cart === null) {
    return (
      <div
        role="status"
        aria-label="Загружаем корзину"
        className="h-64 animate-pulse rounded-xl bg-muted"
      />
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed border-border p-6">
        <p className="text-muted-foreground">Корзина пуста.</p>
        <Link
          href="/menu"
          className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-6")}
        >
          Выбрать в меню
        </Link>
      </div>
    );
  }

  const total = cartTotal(cart);

  return (
    <div className="grid gap-8 md:grid-cols-[3fr_2fr] md:items-start">
      <section
        aria-labelledby="cart-lines-title"
        className="flex flex-col gap-4"
      >
        <h2 id="cart-lines-title" className="sr-only">
          Состав заказа
        </h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {cart.map((line) => (
            <li
              key={line.menuItemId}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium">{line.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(line.price)} за шт.
                </p>
              </div>
              <QuantityStepper
                menuItemId={line.menuItemId}
                name={line.name}
                quantity={line.quantity}
              />
              <span className="w-24 text-right font-semibold text-copper">
                {formatPrice(line.price * line.quantity)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11"
                aria-label={`Убрать «${line.name}» из корзины`}
                onClick={() => setQuantity(line.menuItemId, 0)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 text-lg font-semibold">
          <span>Итого</span>
          <span className="text-copper">{formatPrice(total)}</span>
        </div>
      </section>

      <CheckoutForm
        lines={cart.map(({ menuItemId, quantity }) => ({
          menuItemId,
          quantity,
        }))}
        total={total}
        onPlaced={() => {
          clearCart();
          router.push("/account");
        }}
      />
    </div>
  );
}
