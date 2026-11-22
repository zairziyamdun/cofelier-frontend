"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { useManagedMenu } from "@/entities/menu-item";
import {
  CategoryFormDialog,
  DeleteCategoryDialog,
} from "@/features/menu-admin/category-editor";
import {
  DeleteMenuItemDialog,
  MenuItemFormDialog,
} from "@/features/menu-admin/item-editor";
import { ItemModifierGroups } from "@/features/menu-admin/item-modifiers";
import { PhotoManager } from "@/features/menu-admin/item-photos";
import { Button } from "@/shared/ui/button";

import type { EditorActions, EditorDialog } from "../model/editor-state";
import { CategorySection } from "./CategorySection";

export function MenuEditor() {
  const menu = useManagedMenu();
  const [dialog, setDialog] = useState<EditorDialog>(null);
  const close = () => setDialog(null);

  const actions: EditorActions = {
    addItem: (categoryId) => setDialog({ kind: "item-form", categoryId }),
    editItem: (item) => setDialog({ kind: "item-form", item }),
    deleteItem: (item) => setDialog({ kind: "item-delete", item }),
    renameCategory: (category) =>
      setDialog({ kind: "category-form", category }),
    deleteCategory: (category) =>
      setDialog({ kind: "category-delete", category }),
  };

  if (menu.isPending) return <MenuEditorSkeleton />;

  if (menu.isError) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-border p-6">
        <p>Не получилось загрузить меню: {menu.error.message}</p>
        <Button
          type="button"
          className="min-h-11 px-6"
          onClick={() => void menu.refetch()}
        >
          Попробовать снова
        </Button>
      </div>
    );
  }

  const categories = menu.data;
  const categoryIds = categories.map((category) => category.id);
  // Позиция в окне — свежая из кеша: после загрузки фото меню перечитывается.
  const formItemId = dialog?.kind === "item-form" ? dialog.item?.id : undefined;
  const formItem =
    formItemId === undefined
      ? undefined
      : categories
          .flatMap((category) => category.items)
          .find((item) => item.id === formItemId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          className="min-h-11 px-4"
          disabled={categories.length === 0}
          onClick={() =>
            setDialog({ kind: "item-form", categoryId: categoryIds[0] })
          }
        >
          <Plus aria-hidden="true" />
          Новая позиция
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11 px-4"
          onClick={() => setDialog({ kind: "category-form" })}
        >
          <Plus aria-hidden="true" />
          Новая категория
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
          Меню пустое. Начните с категории — например, «Эспрессо и классика».
        </p>
      ) : (
        categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            categoryIds={categoryIds}
            actions={actions}
          />
        ))
      )}

      <MenuItemFormDialog
        open={dialog?.kind === "item-form"}
        onClose={close}
        categories={categories}
        item={dialog?.kind === "item-form" ? dialog.item : undefined}
        defaultCategoryId={
          dialog?.kind === "item-form" ? dialog.categoryId : undefined
        }
        onCreated={(item) => setDialog({ kind: "item-form", item })}
        photos={
          formItem ? (
            <PhotoManager item={formItem} />
          ) : (
            <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              Фото и добавки можно выбрать сразу после сохранения позиции.
            </p>
          )
        }
        modifiers={formItem ? <ItemModifierGroups item={formItem} /> : null}
      />
      <DeleteMenuItemDialog
        item={dialog?.kind === "item-delete" ? dialog.item : null}
        onClose={close}
      />
      <CategoryFormDialog
        open={dialog?.kind === "category-form"}
        onClose={close}
        category={
          dialog?.kind === "category-form" ? dialog.category : undefined
        }
      />
      <DeleteCategoryDialog
        category={dialog?.kind === "category-delete" ? dialog.category : null}
        onClose={close}
      />
    </div>
  );
}

function MenuEditorSkeleton() {
  return (
    <div
      role="status"
      aria-label="Загружаем меню"
      className="flex animate-pulse flex-col gap-6"
    >
      <div className="h-11 w-72 rounded-lg bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
      <div className="h-48 rounded-xl bg-muted" />
    </div>
  );
}
