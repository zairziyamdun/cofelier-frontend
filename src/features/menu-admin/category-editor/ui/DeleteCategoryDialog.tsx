"use client";

import type { ManagedMenuCategory } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { FormError } from "@/shared/ui/input";

import { useDeleteCategory } from "../api/use-category-mutations";

export function DeleteCategoryDialog({
  category,
  onClose,
}: {
  category: ManagedMenuCategory | null;
  onClose: () => void;
}) {
  const deleteCategory = useDeleteCategory();
  const hasItems = (category?.items.length ?? 0) > 0;

  function handleClose() {
    deleteCategory.reset();
    onClose();
  }

  return (
    <Dialog
      open={category !== null}
      onClose={handleClose}
      title="Удалить категорию?"
    >
      <p className="text-muted-foreground">
        {hasItems
          ? `В «${category?.name}» есть позиции. Сначала удалите их или перенесите в другую категорию.`
          : `Категория «${category?.name}» пустая и исчезнет из меню.`}
      </p>
      <FormError error={deleteCategory.error} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-6"
          onClick={handleClose}
        >
          {hasItems ? "Понятно" : "Отмена"}
        </Button>
        {!hasItems && (
          <Button
            type="button"
            variant="destructive"
            className="min-h-11 px-6"
            disabled={deleteCategory.isPending}
            onClick={() => {
              if (category) {
                deleteCategory.mutate(category.id, { onSuccess: onClose });
              }
            }}
          >
            {deleteCategory.isPending ? "Удаляем…" : "Удалить"}
          </Button>
        )}
      </div>
    </Dialog>
  );
}
