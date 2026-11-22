"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

import { isStaff, useCurrentUser } from "@/entities/user";
import type { Order } from "@/entities/order";
import { ApiError, type ApiSchemas } from "@/shared/api";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { Button, buttonVariants } from "@/shared/ui/button";
import { Field, FormError, Select, Textarea } from "@/shared/ui/input";

import { usePlaceOrder } from "../api/use-place-order";
import { pickupSlots } from "../lib/pickup-slots";

type CheckoutFormProps = {
  lines: ApiSchemas["OrderLineDto"][];
  total: number;
  onPlaced: (order: Order) => void;
  // Сервер ответил 409: цены или наличие в меню изменились — обновить корзину.
  onStale?: () => void;
};

export function CheckoutForm({
  lines,
  total,
  onPlaced,
  onStale,
}: CheckoutFormProps) {
  const {
    data: user,
    isPending,
    unavailable,
    isFetching,
    refetch,
  } = useCurrentUser();
  const placeOrder = usePlaceOrder();
  // Слоты считаются один раз при открытии формы: время не «прыгает» под рукой.
  const [slots] = useState(() => pickupSlots(new Date()));

  if (isPending)
    return <div className="h-64 animate-pulse rounded-xl bg-muted" />;

  // Сбой сервера — не повод звать вошедшего человека входить заново.
  if (unavailable) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <p>Не удалось проверить вход: сервер не отвечает.</p>
        <Button
          size="lg"
          variant="outline"
          className="min-h-11 px-6"
          disabled={isFetching}
          onClick={() => void refetch()}
        >
          Повторить
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6">
        <p>Войдите, чтобы оформить предзаказ — так вы увидите его статус.</p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/login?next=/cart"
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-6")}
          >
            Войти
          </Link>
          {/* Короткая подпись: длинное «Зарегистрироваться» не влезает в узкий экран. */}
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-11 px-6",
            )}
          >
            Регистрация
          </Link>
        </div>
      </div>
    );
  }

  if (isStaff(user.role)) {
    return (
      <p className="rounded-xl border border-dashed border-border p-4 text-muted-foreground sm:p-6">
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
        // Сумма, которую видит гость: разошлась с сервером — заказ не пройдёт молча.
        expectedTotal: total,
      },
      { onSuccess: onPlaced },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-6"
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
          placeholder="Например: погорячее, без крышки"
        />
      </Field>
      <p className="text-sm text-muted-foreground">
        Оплата при получении — наличными или картой.
      </p>
      <FormError error={placeOrder.error} />
      {onStale &&
        placeOrder.error instanceof ApiError &&
        placeOrder.error.status === 409 && (
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            onClick={() => {
              placeOrder.reset();
              onStale();
            }}
          >
            Обновить корзину по меню
          </Button>
        )}
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
