"use client";

import type { ManagedModifierGroup } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { FormError } from "@/shared/ui/input";

import { useDeleteGroup } from "../api/use-modifier-mutations";

export function DeleteGroupDialog({
  group,
  onClose,
}: {
  group: ManagedModifierGroup | null;
  onClose: () => void;
}) {
  const deleteGroup = useDeleteGroup();
  const used = group?.itemIds.length ?? 0;

  function handleClose() {
    deleteGroup.reset();
    onClose();
  }

  return (
    <Dialog
      open={group !== null}
      onClose={handleClose}
      title="Удалить группу добавок?"
    >
      <p>
        «{group?.name}» пропадёт
        {used > 0 ? ` у ${used} поз.` : ""} в меню и у гостей в шторке. Старые
        заказы не изменятся.
      </p>
      <FormError error={deleteGroup.error} />
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
          disabled={deleteGroup.isPending || !group}
          onClick={() =>
            group && deleteGroup.mutate(group.id, { onSuccess: handleClose })
          }
        >
          Удалить
        </Button>
      </div>
    </Dialog>
  );
}
