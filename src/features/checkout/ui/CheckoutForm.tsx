"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { isStaff, useCurrentUser } from "@/entities/user";
import type { Order } from "@/entities/order";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Field, FormError, Select, Textarea } from "@/shared/ui/input";

import { usePlaceOrder } from "../api/use-place-order";
import { pickupSlots } from "../lib/pickup-slots";

type CheckoutFormProps = {
  lines: { menuItemId: number; quantity: number }[];
  total: number;
  onPlaced: (order: Order) => void;
};

export function CheckoutForm({ lines, total, onPlaced }: CheckoutFormProps) {
  const { data: user, isPending } = useCurrentUser();
  const placeOrder = usePlaceOrder();
  // Слоты считаются один раз при открытии формы: время не «прыгает» под рукой.
  const [slots] = useState(() => pickupSlots(new Date()));

  if (isPending)
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  if (!user) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <p>Войдите, чтобы оформить предзаказ — так вы увидите его статус.</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/login?next=/cart"
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-6")}
          >
            Войти
          </Link>
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 px-6",
            )}
          >
            Зарегистрироваться
          </Link>
        </div>
      </div>
    );
  }

  if (isStaff(user.role)) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
        Предзаказ оформляют клиенты. Вы вошли как сотрудник.
      </p>
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const pickupAt = String(form.get("pickupAt") ?? "");
    placeOrder.mutate(
      {
        items: lines,
        comment: String(form.get("comment") ?? ""),
        pickupAt: pickupAt || null,
      },
      { onSuccess: onPlaced },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
    >
      <Field label="Когда зайдёте" htmlFor="checkout-pickup">
        <Select id="checkout-pickup" name="pickupAt" defaultValue="">
          <option value="">Как можно скорее</option>
          {slots.map((slot) => (
            <option key={slot.value} value={slot.value}>
              {slot.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Комментарий" htmlFor="checkout-comment">
        <Textarea
          id="checkout-comment"
          name="comment"
          maxLength={300}
          placeholder="Без сахара, на овсяном молоке…"
        />
      </Field>
      <p className="text-sm text-muted-foreground">
        Оплата при получении — наличными или картой.
      </p>
      <FormError error={placeOrder.error} />
      <Button
        type="submit"
        size="lg"
        className="min-h-11"
        disabled={placeOrder.isPending}
      >
        {placeOrder.isPending
          ? "Оформляем…"
          : `Оформить заказ · ${formatPrice(total)}`}
      </Button>
    </form>
  );
}
