"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";

import { cartCount, useCart } from "../model/cart-store";

export function CartLink() {
  const cart = useCart();
  const count = cart ? cartCount(cart) : 0;

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Корзина: ${count} шт.` : "Корзина"}
      className="relative flex size-11 items-center justify-center rounded-lg hover:bg-muted"
    >
      <ShoppingBag aria-hidden="true" className="size-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex min-w-5 items-center justify-center rounded-full bg-copper px-1 text-xs font-semibold text-charcoal">
          {count}
        </span>
      )}
    </Link>
  );
}
