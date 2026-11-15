"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

import { acquireOrdersSocket, releaseOrdersSocket } from "@/shared/realtime";

import { isActiveStatus } from "../lib/status";
import type { Order, StaffOrder } from "../model/types";
import { orderKeys } from "./order.queries";

// Подписка на события заказов: кладёт их прямо в кеш очереди и «моих заказов».
// После переподключения — перечитывает списки: события за разрыв могли потеряться.
export function useLiveOrders(options?: {
  onCreated?: (order: StaffOrder) => void;
}) {
  const queryClient = useQueryClient();
  const [connected, setConnected] = useState(false);
  const onCreatedRef = useRef(options?.onCreated);

  useEffect(() => {
    onCreatedRef.current = options?.onCreated;
  });

  // Подписка на внешний источник (WebSocket) с отпиской в cleanup.
  useEffect(() => {
    const socket = acquireOrdersSocket();

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

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleReconnect = () =>
      void queryClient.invalidateQueries({ queryKey: orderKeys.all });

    socket.on("order.created", handleCreated);
    socket.on("order.updated", handleUpdated);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.io.on("reconnect", handleReconnect);
    // Сокет мог подключиться раньше (общий с другим компонентом) — тогда
    // события connect не будет; читаем текущее состояние после подписки.
    queueMicrotask(() => setConnected(socket.connected));

    return () => {
      socket.off("order.created", handleCreated);
      socket.off("order.updated", handleUpdated);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.io.off("reconnect", handleReconnect);
      releaseOrdersSocket();
    };
  }, [queryClient]);

  return { connected };
}
