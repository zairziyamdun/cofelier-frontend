"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/shared/ui/button";

import { useReorderCategories } from "../api/use-category-mutations";
import { moveId } from "../lib/move";

// Сдвиг категории вверх или вниз; порядок на сайте меняется сразу после сохранения.
export function CategoryOrderButtons({
  categoryIds,
  categoryId,
  categoryName,
}: {
  categoryIds: number[];
  categoryId: number;
  categoryName: string;
}) {
  const reorder = useReorderCategories();
  const index = categoryIds.indexOf(categoryId);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={`Поднять «${categoryName}»`}
        disabled={index <= 0 || reorder.isPending}
        onClick={() => reorder.mutate(moveId(categoryIds, categoryId, -1))}
      >
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11"
        aria-label={`Опустить «${categoryName}»`}
        disabled={index === categoryIds.length - 1 || reorder.isPending}
        onClick={() => reorder.mutate(moveId(categoryIds, categoryId, 1))}
      >
        <ArrowDown aria-hidden="true" />
      </Button>
    </>
  );
}
