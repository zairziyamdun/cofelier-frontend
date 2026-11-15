import { Pencil, Plus, Trash2 } from "lucide-react";

import type { ManagedMenuCategory } from "@/entities/menu-item";
import { CategoryOrderButtons } from "@/features/menu-admin/category-editor";
import { Button } from "@/shared/ui/button";

import type { EditorActions } from "../model/editor-state";
import { MenuItemRow } from "./MenuItemRow";

export function CategorySection({
  category,
  categoryIds,
  actions,
}: {
  category: ManagedMenuCategory;
  categoryIds: number[];
  actions: EditorActions;
}) {
  const stopListed = category.items.filter((item) => item.inStopList).length;

  return (
    <section
      aria-labelledby={`category-${category.id}`}
      className="rounded-xl border border-border bg-card"
    >
      <header className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id={`category-${category.id}`} className="font-heading text-2xl">
            {category.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            Позиций: {category.items.length}
            {stopListed > 0 && ` · в стоп-листе: ${stopListed}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <CategoryOrderButtons
            categoryIds={categoryIds}
            categoryId={category.id}
            categoryName={category.name}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={`Переименовать «${category.name}»`}
            onClick={() => actions.renameCategory(category)}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-destructive"
            aria-label={`Удалить категорию «${category.name}»`}
            onClick={() => actions.deleteCategory(category)}
          >
            <Trash2 aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-11 px-4"
            onClick={() => actions.addItem(category.id)}
          >
            <Plus aria-hidden="true" />
            Позиция
          </Button>
        </div>
      </header>

      {category.items.length === 0 ? (
        <p className="p-4 text-muted-foreground">
          Пустая категория не видна на сайте. Добавьте первую позицию.
        </p>
      ) : (
        <ul className="divide-y divide-border">
          {category.items.map((item) => (
            <MenuItemRow key={item.id} item={item} actions={actions} />
          ))}
        </ul>
      )}
    </section>
  );
}
