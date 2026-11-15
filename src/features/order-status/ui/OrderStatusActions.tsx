"use client";

import { useState } from "react";

import { staffActions, type StaffOrder } from "@/entities/order";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { FormError } from "@/shared/ui/input";

import { useChangeOrderStatus } from "../api/use-change-status";

// Кнопки следующего шага для заказа; отмена — только с подтверждением.
export function OrderStatusActions({ order }: { order: StaffOrder }) {
  const changeStatus = useChangeOrderStatus();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const actions = staffActions[order.status];

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((action) =>
          action.tone === "primary" ? (
            <Button
              key={action.to}
              type="button"
              className="min-h-11 flex-1 px-4"
              disabled={changeStatus.isPending}
              onClick={() =>
                changeStatus.mutate({ id: order.id, status: action.to })
              }
            >
              {action.label}
            </Button>
          ) : (
            <Button
              key={action.to}
              type="button"
              variant="ghost"
              className="min-h-11 px-4 text-destructive"
              disabled={changeStatus.isPending}
              onClick={() => setConfirmCancel(true)}
            >
              {action.label}
            </Button>
          ),
        )}
      </div>
      {!confirmCancel && <FormError error={changeStatus.error} />}

      <Dialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        title={`Отменить заказ № ${order.id}?`}
      >
        <p className="text-muted-foreground">
          {order.customerName} увидит, что заказ отменён. Вернуть его нельзя.
        </p>
        <FormError error={changeStatus.error} />
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="min-h-11 px-6"
            onClick={() => setConfirmCancel(false)}
          >
            Не отменять
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 px-6"
            disabled={changeStatus.isPending}
            onClick={() =>
              changeStatus.mutate(
                { id: order.id, status: "cancelled" },
                { onSuccess: () => setConfirmCancel(false) },
              )
            }
          >
            Отменить заказ
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
