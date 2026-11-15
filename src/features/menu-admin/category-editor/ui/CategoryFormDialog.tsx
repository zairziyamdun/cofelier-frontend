"use client";

import type { FormEvent } from "react";

import type { ManagedMenuCategory } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input } from "@/shared/ui/input";

import {
  useCreateCategory,
  useRenameCategory,
} from "../api/use-category-mutations";

// Нет категории — создание; есть — переименование.
export function CategoryFormDialog({
  open,
  onClose,
  category,
}: {
  open: boolean;
  onClose: () => void;
  category?: ManagedMenuCategory;
}) {
  const createCategory = useCreateCategory();
  const renameCategory = useRenameCategory();
  const mutation = category ? renameCategory : createCategory;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = String(new FormData(event.currentTarget).get("name") ?? "");
    const options = { onSuccess: onClose };
    if (category) renameCategory.mutate({ id: category.id, name }, options);
    else createCategory.mutate(name, options);
  }

  function handleClose() {
    createCategory.reset();
    renameCategory.reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={category ? "Переименовать категорию" : "Новая категория"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field
          label="Название"
          htmlFor="category-name"
          hint={category ? undefined : "Категория появится в конце меню."}
        >
          <Input
            id="category-name"
            name="name"
            required
            minLength={2}
            maxLength={60}
            defaultValue={category?.name}
          />
        </Field>
        <FormError error={mutation.error} />
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
            type="submit"
            className="min-h-11 px-6"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Сохраняем…" : "Сохранить"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
