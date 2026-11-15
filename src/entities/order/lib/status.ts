import type { OrderStatus } from "../model/types";

// Те же статусы и переходы, что в бэкенде (orders/order-status.ts).
export const statusLabels: Record<OrderStatus, string> = {
  new: "Новый",
  accepted: "Принят",
  preparing: "Готовится",
  ready: "Готов",
  completed: "Выдан",
  cancelled: "Отменён",
};

// Что видит клиент: человеческая фраза вместо статуса.
export const statusHints: Record<OrderStatus, string> = {
  new: "Ждёт подтверждения бариста",
  accepted: "Бариста принял заказ",
  preparing: "Готовим",
  ready: "Готово — заберите у стойки",
  completed: "Выдан",
  cancelled: "Отменён",
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  "new",
  "accepted",
  "preparing",
  "ready",
];

export function isActiveStatus(status: OrderStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export type StaffAction = {
  to: OrderStatus;
  label: string;
  tone: "primary" | "cancel";
};

// Кнопки бариста для каждого статуса: шаг вперёд и, пока можно, отмена.
export const staffActions: Record<OrderStatus, StaffAction[]> = {
  new: [
    { to: "accepted", label: "Принять", tone: "primary" },
    { to: "cancelled", label: "Отменить", tone: "cancel" },
  ],
  accepted: [
    { to: "preparing", label: "Готовить", tone: "primary" },
    { to: "cancelled", label: "Отменить", tone: "cancel" },
  ],
  preparing: [{ to: "ready", label: "Готов", tone: "primary" }],
  ready: [{ to: "completed", label: "Выдан", tone: "primary" }],
  completed: [],
  cancelled: [],
};
