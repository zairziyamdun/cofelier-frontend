"use client";

import { useSyncExternalStore } from "react";

// Добавка в строке корзины: что отправить на сервер и как подписать строку.
export type CartModifier = {
  optionId: number;
  quantity: number;
  label: string;
  isDefault: boolean;
};

// Корзина живёт в браузере (localStorage) и переживает перезагрузку.
// Строка — товар с набором добавок: капучино на овсяном и на обычном — две
// строки. Цена здесь — только для показа: сумму заказа считает сервер.
export type CartLine = {
  key: string;
  menuItemId: number;
  name: string;
  // За штуку вместе с добавками.
  price: number;
  quantity: number;
  modifiers: CartModifier[];
};

export type CartLineDraft = Omit<CartLine, "key" | "quantity">;

const STORAGE_KEY = "cofelier-cart";
export const MAX_QUANTITY = 20;

let lines: CartLine[] | null = null;
const listeners = new Set<() => void>();

// Одинаковый набор добавок — одна строка, порядок выбора не важен.
export function lineKey(
  menuItemId: number,
  modifiers: Pick<CartModifier, "optionId" | "quantity">[],
): string {
  const parts = [...modifiers]
    .sort((a, b) => a.optionId - b.optionId)
    .map((modifier) => `${modifier.optionId}x${modifier.quantity}`);
  return `${menuItemId}:${parts.join(",")}`;
}

function isModifier(value: unknown): value is CartModifier {
  if (typeof value !== "object" || value === null) return false;
  const modifier = value as Record<string, unknown>;
  return (
    typeof modifier.optionId === "number" &&
    typeof modifier.quantity === "number" &&
    typeof modifier.label === "string" &&
    typeof modifier.isDefault === "boolean"
  );
}

// Строки из прошлых версий сайта (без добавок и ключа) не теряем — дополняем.
export function toCartLine(value: unknown): CartLine | null {
  if (typeof value !== "object" || value === null) return null;
  const line = value as Record<string, unknown>;
  if (
    typeof line.menuItemId !== "number" ||
    typeof line.name !== "string" ||
    typeof line.price !== "number" ||
    typeof line.quantity !== "number"
  ) {
    return null;
  }
  const modifiers = Array.isArray(line.modifiers)
    ? line.modifiers.filter(isModifier)
    : [];
  return {
    key: lineKey(line.menuItemId, modifiers),
    menuItemId: line.menuItemId,
    name: line.name,
    price: line.price,
    quantity: line.quantity,
    modifiers,
  };
}

function readStorage(): CartLine[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((value) => {
      const line = toCartLine(value);
      return line ? [line] : [];
    });
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

export function addToCart(draft: CartLineDraft, quantity = 1) {
  const key = lineKey(draft.menuItemId, draft.modifiers);
  const current = getSnapshot();
  const existing = current.find((line) => line.key === key);
  if (existing) {
    setQuantity(key, existing.quantity + quantity);
    return;
  }
  setLines([
    ...current,
    { ...draft, key, quantity: Math.min(quantity, MAX_QUANTITY) },
  ]);
}

// 0 и меньше — убрать из корзины.
export function setQuantity(key: string, quantity: number) {
  const current = getSnapshot();
  if (quantity <= 0) {
    setLines(current.filter((line) => line.key !== key));
    return;
  }
  setLines(
    current.map((line) =>
      line.key === key
        ? { ...line, quantity: Math.min(quantity, MAX_QUANTITY) }
        : line,
    ),
  );
}

// Свежие цены из меню; строки, которые больше не собрать, — убрать.
// Возвращает названия изменившихся и убранных — показать гостю.
export function repriceCart(
  reprice: (line: CartLine) => { price: number } | null,
): { changed: string[]; removed: string[] } {
  const changed: string[] = [];
  const removed: string[] = [];
  const next = getSnapshot().flatMap((line) => {
    const fresh = reprice(line);
    if (!fresh) {
      removed.push(line.name);
      return [];
    }
    if (fresh.price !== line.price) changed.push(line.name);
    return [{ ...line, price: fresh.price }];
  });
  setLines(next);
  return { changed, removed };
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
