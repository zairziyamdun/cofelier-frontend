"use client";

import { ArrowRight, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import type { MenuCategory } from "@/entities/menu-item";
import { useRepeatOrder } from "@/entities/order";
import { isStaff, useCurrentUser } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";

import { repeatSummary, repeatToCart } from "../lib/repeat";
import { addToCart } from "../model/cart-store";

// «Как в прошлый раз»: постоянный гость повторяет заказ в два касания
// (повторить → оформить). Видно только вошедшему клиенту с заказами.
export function RepeatLastOrder({
  categories,
}: {
  categories: MenuCategory[];
}) {
  const { data: user } = useCurrentUser();
  const isClient = Boolean(user && !isStaff(user.role));
  const repeat = useRepeatOrder(isClient);
  const [result, setResult] = useState<{
    added: number;
    unavailable: { name: string; reason: string }[];
  } | null>(null);

  const data = repeat.data;
  if (!isClient || !data || data.lines.length === 0) return null;
  const { lines, unavailable } = repeatToCart(data, categories);
  // Повторять нечего — карточка только мешала бы.
  if (lines.length === 0 && !result) return null;

  const handleRepeat = () => {
    for (const line of lines) addToCart(line.draft, line.quantity);
    setResult({ added: lines.length, unavailable });
  };

  return (
    <section
      aria-labelledby="repeat-title"
      className="flex flex-col gap-3 rounded-xl border border-copper/40 bg-copper/10 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 id="repeat-title" className="font-medium">
            Как в прошлый раз
          </h2>
          <p className="text-sm break-words text-muted-foreground">
            {repeatSummary(data)}
          </p>
        </div>
        {result ? (
          <Link
            href="/cart"
            className={cn(
              buttonVariants(),
              "min-h-11 rounded-full bg-copper px-5 text-charcoal hover:bg-copper/85",
            )}
          >
            В корзину
            <ArrowRight aria-hidden="true" />
          </Link>
        ) : (
          <Button
            type="button"
            className="min-h-11 rounded-full bg-copper px-5 text-charcoal hover:bg-copper/85"
            onClick={handleRepeat}
          >
            <RotateCcw aria-hidden="true" />
            Повторить
          </Button>
        )}
      </div>
      {result && (
        <p role="status" className="text-sm">
          Добавили в корзину: {result.added} поз.
        </p>
      )}
      {(result?.unavailable ?? unavailable).length > 0 && (
        <ul className="text-sm text-muted-foreground">
          {(result?.unavailable ?? unavailable).map((line) => (
            <li key={line.name}>
              Не получится: {line.name} — {line.reason}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
