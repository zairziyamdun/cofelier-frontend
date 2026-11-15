"use client";

import { Bell, BellOff } from "lucide-react";
import { useState } from "react";

import {
  ACTIVE_STATUSES,
  statusLabels,
  useLiveOrders,
  useOrderQueue,
} from "@/entities/order";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { playChime, unlockChime } from "../lib/chime";
import { OrderCard } from "./OrderCard";

// Живая очередь: новые заказы приходят по WebSocket, колонки — по статусам.
export function OrderQueue() {
  const queue = useOrderQueue();
  const [soundOn, setSoundOn] = useState(false);
  const [freshIds, setFreshIds] = useState<number[]>([]);
  const { connected } = useLiveOrders({
    onCreated: (order) => {
      setFreshIds((ids) => [...ids, order.id]);
      if (soundOn) playChime();
    },
  });

  if (queue.isPending) {
    return (
      <div
        role="status"
        aria-label="Загружаем очередь"
        className="grid animate-pulse gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        {ACTIVE_STATUSES.map((status) => (
          <div key={status} className="h-64 rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (queue.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border p-6">
        <p>Не получилось загрузить очередь: {queue.error.message}</p>
        <Button
          type="button"
          className="min-h-11 px-6"
          onClick={() => void queue.refetch()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  const orders = queue.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <span
          role="status"
          className={cn(
            "flex items-center gap-2 text-sm",
            connected ? "text-foreground" : "text-destructive",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-2 rounded-full",
              connected ? "bg-copper" : "bg-destructive",
            )}
          />
          {connected
            ? "Онлайн: новые заказы появятся сами"
            : "Нет связи — переподключаемся…"}
        </span>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-4"
          aria-pressed={soundOn}
          onClick={() => {
            if (!soundOn) unlockChime();
            setSoundOn(!soundOn);
          }}
        >
          {soundOn ? (
            <Bell aria-hidden="true" />
          ) : (
            <BellOff aria-hidden="true" />
          )}
          {soundOn ? "Звук включён" : "Включить звук"}
        </Button>
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
          Активных заказов нет. Новый появится здесь без перезагрузки.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {ACTIVE_STATUSES.map((status) => {
            const column = orders.filter((order) => order.status === status);
            return (
              <section
                key={status}
                aria-labelledby={`column-${status}`}
                className="flex flex-col gap-4"
              >
                <h2
                  id={`column-${status}`}
                  className="flex items-center justify-between font-heading text-xl"
                >
                  {statusLabels[status]}
                  <span className="rounded-full bg-muted px-2 font-sans text-sm">
                    {column.length}
                  </span>
                </h2>
                {column.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    highlighted={freshIds.includes(order.id)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
