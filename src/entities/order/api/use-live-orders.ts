"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { acquireOrdersSocket, releaseOrdersSocket } from "@/shared/realtime";

import { isActiveStatus } from "../lib/status";
import type { Order, StaffOrder } from "../model/types";
import { orderKeys } from "./order.queries";

// Короткий разрыв (вернулись на вкладку, сокет переподключается за секунду)
// не показываем как «Нет связи», чтобы индикатор не мигал.
const OFFLINE_GRACE_MS = 3_000;
const STABLE_MS = 1_000;

// Подписка на события заказов: кладёт их прямо в кеш очереди и «моих заказов».
// После каждого повторного подключения — перечитывает списки: события за
// разрыв могли потеряться.
export function useLiveOrders(options?: {
  onCreated?: (order: StaffOrder) => void;
}) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(true);
  const onCreatedRef = useRef(options?.onCreated);

  useEffect(() => {
    onCreatedRef.current = options?.onCreated;
  });

  // Подписка на внешний источник (WebSocket) с отпиской в cleanup.
  useEffect(() => {
    const socket = acquireOrdersSocket();
    let offlineTimer: ReturnType<typeof setTimeout> | undefined;
    let stableTimer: ReturnType<typeof setTimeout> | undefined;
    let wasConnected = socket.connected;

    const handleCreated = (order: StaffOrder) => {
      queryClient.setQueryData<StaffOrder[]>(orderKeys.queue(), (queue) =>
        queue && !queue.some((item) => item.id === order.id)
          ? [...queue, order]
          : queue,
      );
      onCreatedRef.current?.(order);
    };

    const handleUpdated = (order: Order | StaffOrder) => {
      queryClient.setQueryData<StaffOrder[]>(orderKeys.queue(), (queue) =>
        queue?.flatMap((item) => {
          if (item.id !== order.id) return [item];
          return isActiveStatus(order.status) ? [{ ...item, ...order }] : [];
        }),
      );
      queryClient.setQueryData<Order[]>(orderKeys.my(), (orders) =>
        orders?.map((item) =>
          item.id === order.id ? { ...item, ...order } : item,
        ),
      );
    };

    // Таймер ставится один раз за разрыв: повторные ошибки попыток его не
    // сдвигают, иначе «Нет связи» не показалось бы никогда.
    const markOffline = () => {
      if (offlineTimer) return;
      offlineTimer = setTimeout(() => setConnected(false), OFFLINE_GRACE_MS);
    };

    // Сервер может закрыть подключение сразу после «connect» (токен не
    // принят), поэтому связь считаем настоящей, если она продержалась.
    const handleConnect = () => {
      clearTimeout(stableTimer);
      stableTimer = setTimeout(() => {
        if (!socket.connected) return;
        clearTimeout(offlineTimer);
        offlineTimer = undefined;
        setConnected(true);
        // Подключились снова после разрыва — догоняем пропущенные события.
        if (wasConnected) {
          void queryClient.invalidateQueries({ queryKey: orderKeys.all });
        }
        wasConnected = true;
      }, STABLE_MS);
    };

    const handleDrop = () => {
      clearTimeout(stableTimer);
      markOffline();
    };

    socket.on("order.created", handleCreated);
    socket.on("order.updated", handleUpdated);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDrop);
    socket.on("connect_error", handleDrop);
    // Если сокет ещё не подключён, через паузу покажем «Нет связи»;
    // connect отменит таймер.
    if (!socket.connected) markOffline();

    return () => {
      clearTimeout(offlineTimer);
      clearTimeout(stableTimer);
      socket.off("order.created", handleCreated);
      socket.off("order.updated", handleUpdated);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDrop);
      socket.off("connect_error", handleDrop);
      releaseOrdersSocket();
    };
  }, [queryClient]);

  return { connected };
}
