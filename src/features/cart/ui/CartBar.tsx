"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { formatPrice } from "@/shared/lib/format-price";

import { cartCount, cartTotal, useCart } from "../model/cart-store";

// Там, где корзина уже на экране или мешала бы (вход), полоса не нужна.
const HIDDEN_ON = ["/cart", "/login", "/register"];

function positions(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} позиция`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} позиции`;
  }
  return `${count} позиций`;
}

// Полоса корзины внизу экрана: от любого места сайта — одно касание до
// оформления. sticky, а не fixed: в конце страницы встаёт над подвалом и
// ничего не закрывает.
export function CartBar() {
  const cart = useCart();
  const pathname = usePathname();
  if (!cart || cart.length === 0) return null;
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;

  return (
    <div className="pointer-events-none sticky bottom-0 z-40 px-4 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Link
        href="/cart"
        className="pointer-events-auto mx-auto flex min-h-12 max-w-lg items-center justify-between gap-3 rounded-full bg-copper px-5 text-charcoal shadow-[0_12px_32px_-12px] shadow-charcoal/60 transition-colors hover:bg-copper/90"
      >
        <span className="text-sm font-medium">
          {positions(cartCount(cart))} · {formatPrice(cartTotal(cart))}
        </span>
        <span className="flex items-center gap-1 font-semibold">
          Оформить
          <ArrowRight aria-hidden="true" className="size-4" />
        </span>
      </Link>
    </div>
  );
}
