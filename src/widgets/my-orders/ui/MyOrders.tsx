"use client";

import Link from "next/link";

import {
  isActiveStatus,
  OrderLines,
  OrderStatusBadge,
  statusHints,
  useLiveOrders,
  useMyOrders,
} from "@/entities/order";
import { formatDateTime, formatTime } from "@/shared/lib/format-time";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

// История заказов клиента; статус активных обновляется сам (WebSocket).
export function MyOrders() {
  const orders = useMyOrders();
  useLiveOrders();

  if (orders.isPending) {
    return (
      <div
        role="status"
        aria-label="Загружаем заказы"
        className="h-40 animate-pulse rounded-xl bg-muted"
      />
    );
  }

  if (orders.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border p-6">
        <p>Не получилось загрузить заказы: {orders.error.message}</p>
        <Button
          type="button"
          className="min-h-11 px-6"
          onClick={() => void orders.refetch()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  if (orders.data.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
        Заказов пока нет.{" "}
        <Link href="/menu" className="text-copper hover:underline">
          Выбрать в меню
        </Link>
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.data.map((order) => (
        <li
          key={order.id}
          className={cn(
            "flex flex-col gap-4 rounded-xl border bg-card p-4 md:p-6",
            order.status === "ready" ? "border-copper" : "border-border",
          )}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-heading text-xl">Заказ № {order.id}</p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(order.createdAt)}
                {" · "}
                {order.pickupAt
                  ? `заберу к ${formatTime(order.pickupAt)}`
                  : "как можно скорее"}
              </p>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
          {isActiveStatus(order.status) && (
            <p aria-live="polite" className="font-medium">
              {statusHints[order.status]}
            </p>
          )}
          <OrderLines order={order} />
          {order.comment && (
            <p className="text-sm text-muted-foreground">«{order.comment}»</p>
          )}
        </li>
      ))}
    </ul>
  );
}
