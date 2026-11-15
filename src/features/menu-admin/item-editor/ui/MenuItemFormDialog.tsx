"use client";

import type { FormEvent } from "react";

import type {
  ManagedMenuCategory,
  ManagedMenuItem,
} from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input, Select, Textarea } from "@/shared/ui/input";

import {
  useCreateMenuItem,
  useUpdateMenuItem,
  type MenuItemBody,
} from "../api/use-menu-item-mutations";

type MenuItemFormDialogProps = {
  open: boolean;
  onClose: () => void;
  categories: ManagedMenuCategory[];
  // Нет позиции — создание; есть — правка.
  item?: ManagedMenuItem;
  defaultCategoryId?: number;
};

function readBody(form: HTMLFormElement): MenuItemBody {
  const data = new FormData(form);
  return {
    categoryId: Number(data.get("categoryId")),
    name: String(data.get("name") ?? ""),
    portion: String(data.get("portion") ?? ""),
    description: String(data.get("description") ?? ""),
    price: Number(data.get("price")),
  };
}

export function MenuItemFormDialog({
  open,
  onClose,
  categories,
  item,
  defaultCategoryId,
}: MenuItemFormDialogProps) {
  const createItem = useCreateMenuItem();
  const updateItem = useUpdateMenuItem();
  const mutation = item ? updateItem : createItem;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = readBody(event.currentTarget);
    const options = { onSuccess: onClose };
    if (item) updateItem.mutate({ id: item.id, body }, options);
    else createItem.mutate(body, options);
  }

  function handleClose() {
    createItem.reset();
    updateItem.reset();
    onClose();
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={item ? "Изменить позицию" : "Новая позиция"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Категория" htmlFor="item-category">
          <Select
            id="item-category"
            name="categoryId"
            required
            defaultValue={item?.categoryId ?? defaultCategoryId}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Название" htmlFor="item-name">
          <Input
            id="item-name"
            name="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={item?.name}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Цена, ₸" htmlFor="item-price">
            <Input
              id="item-price"
              name="price"
              type="number"
              inputMode="numeric"
              required
              min={1}
              step={1}
              defaultValue={item?.price}
            />
          </Field>
          <Field label="Объём или вес" htmlFor="item-portion">
            <Input
              id="item-portion"
              name="portion"
              placeholder="300 мл"
              maxLength={30}
              defaultValue={item?.portion ?? ""}
            />
          </Field>
        </div>
        <Field label="Описание" htmlFor="item-description">
          <Textarea
            id="item-description"
            name="description"
            maxLength={300}
            defaultValue={item?.description ?? ""}
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
