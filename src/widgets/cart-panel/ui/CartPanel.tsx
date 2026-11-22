"use client";

import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { menuKeys, publicMenuQueryOptions } from "@/entities/menu-item";
import {
  cartTotal,
  clearCart,
  QuantityStepper,
  repriceCart,
  repriceLine,
  setQuantity,
  useCart,
  type CartLine,
} from "@/features/cart";
import { CheckoutForm } from "@/features/checkout";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

export function CartPanel() {
  const cart = useCart();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState<string | null>(null);

  // Меню изменилось, пока корзина лежала: берём свежее и пересчитываем строки.
  const refreshFromMenu = async () => {
    await queryClient.invalidateQueries({ queryKey: menuKeys.public() });
    const categories = await queryClient.fetchQuery(publicMenuQueryOptions());
    const { changed, removed } = repriceCart((line) =>
      repriceLine(categories, line),
    );
    setNotice(
      [
        changed.length > 0 && `Цены обновлены: ${changed.join(", ")}.`,
        removed.length > 0 &&
          `Больше нельзя заказать: ${removed.join(", ")} — убрали из корзины.`,
      ]
        .filter(Boolean)
        .join(" ") || "Корзина совпадает с меню — попробуйте ещё раз.",
    );
  };

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
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr] md:items-start">
      <section
        aria-labelledby="cart-lines-title"
        className="flex flex-col gap-4"
      >
        <h2 id="cart-lines-title" className="sr-only">
          Состав заказа
        </h2>
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {cart.map((line) => (
            // Узкий экран: название и крестик сверху, количество и сумма под ними;
            // с sm обёртка растворяется (contents) и всё встаёт в одну строку.
            <li
              key={line.key}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_6rem_auto] sm:items-center sm:gap-x-4"
            >
              <div className="min-w-0">
                <p className="font-medium break-words">{line.name}</p>
                <ModifierSummary line={line} />
                <p className="text-sm text-muted-foreground">
                  {formatPrice(line.price)} за шт.
                </p>
              </div>
              <div className="col-span-2 row-start-2 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:contents">
                <QuantityStepper
                  lineKey={line.key}
                  name={line.name}
                  quantity={line.quantity}
                />
                <span className="font-semibold whitespace-nowrap text-copper sm:text-right">
                  {formatPrice(line.price * line.quantity)}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="col-start-2 row-start-1 size-11 sm:col-start-4"
                aria-label={`Убрать «${line.name}» из корзины`}
                onClick={() => setQuantity(line.key, 0)}
              >
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-x-4 text-lg font-semibold">
          <span>Итого</span>
          <span className="text-copper">{formatPrice(total)}</span>
        </div>
      </section>

      <div className="flex flex-col gap-3">
        {notice && (
          <p
            role="status"
            className="rounded-xl border border-copper/40 bg-copper/10 p-3 text-sm"
          >
            {notice}
          </p>
        )}
        <CheckoutForm
          lines={cart.map(({ menuItemId, quantity, modifiers }) => ({
            menuItemId,
            quantity,
            modifiers: modifiers.map(({ optionId, quantity: count }) => ({
              optionId,
              quantity: count,
            })),
          }))}
          total={total}
          onStale={() => void refreshFromMenu()}
          onPlaced={() => {
            clearCart();
            router.push("/account");
          }}
        />
      </div>
    </div>
  );
}

// Под названием — только то, что отличается от варианта по умолчанию:
// «Овсяное, Карамель». Всё по умолчанию — строки нет.
function ModifierSummary({ line }: { line: CartLine }) {
  const changed = line.modifiers.filter((modifier) => !modifier.isDefault);
  if (changed.length === 0) return null;
  return (
    <p className="text-sm break-words">
      {changed.map((modifier) => modifier.label).join(", ")}
    </p>
  );
}
