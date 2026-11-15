"use client";

import { useSyncExternalStore } from "react";

// Корзина живёт в браузере (localStorage) и переживает перезагрузку.
// Цена здесь — только для показа: сумму заказа считает сервер.
export type CartLine = {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
};

const STORAGE_KEY = "cofelier-cart";
export const MAX_QUANTITY = 20;

let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

function isCartLine(value: unknown): value is CartLine {
  if (typeof value !== "object" || value === null) return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.menuItemId === "number" &&
    typeof line.name === "string" &&
    typeof line.price === "number" &&
    typeof line.quantity === "number"
  );
}

function readStorage(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

function setLines(next: CartLine[]) {
  lines = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Приватный режим или переполнение: корзина работает до закрытия вкладки.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Другая вкладка изменила корзину — перечитываем.
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    lines = readStorage();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): CartLine[] {
  lines ??= readStorage();
  return lines;
}

// На сервере и при гидратации корзина «ещё не загружена» — null.
function getServerSnapshot(): CartLine[] | null {
  return null;
}

export function useCart(): CartLine[] | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function addToCart(item: Omit<CartLine, "quantity">) {
  const current = getSnapshot();
  const existing = current.find((line) => line.menuItemId === item.menuItemId);
  if (existing) {
    setQuantity(item.menuItemId, existing.quantity + 1);
    return;
  }
  setLines([...current, { ...item, quantity: 1 }]);
}

// 0 и меньше — убрать из корзины.
export function setQuantity(menuItemId: number, quantity: number) {
  const current = getSnapshot();
  if (quantity <= 0) {
    setLines(current.filter((line) => line.menuItemId !== menuItemId));
    return;
  }
  setLines(
    current.map((line) =>
      line.menuItemId === menuItemId
        ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
        : line,
    ),
  );
}

export function clearCart() {
  setLines([]);
}

export function cartCount(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
}
