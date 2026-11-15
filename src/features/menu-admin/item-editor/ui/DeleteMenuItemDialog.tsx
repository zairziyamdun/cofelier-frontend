"use client";

import type { ManagedMenuItem } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { FormError } from "@/shared/ui/input";

import { useDeleteMenuItem } from "../api/use-menu-item-mutations";

export function DeleteMenuItemDialog({
  item,
  onClose,
}: {
  item: ManagedMenuItem | null;
  onClose: () => void;
}) {
  const deleteItem = useDeleteMenuItem();

  function handleClose() {
    deleteItem.reset();
    onClose();
  }

  return (
    <Dialog open={item !== null} onClose={handleClose} title="Удалить позицию?">
      <p className="text-muted-foreground">
        «{item?.name}» исчезнет из меню на сайте. Это действие нельзя отменить —
        если позиция закончилась временно, лучше поставить её в стоп-лист.
      </p>
      <FormError error={deleteItem.error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-6"
          onClick={handleClose}
        >
          Отмена
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="min-h-11 px-6"
          disabled={deleteItem.isPending}
          onClick={() => {
            if (item) deleteItem.mutate(item.id, { onSuccess: onClose });
          }}
        >
          {deleteItem.isPending ? "Удаляем…" : "Удалить"}
        </Button>
      </div>
    </Dialog>
  );
}
