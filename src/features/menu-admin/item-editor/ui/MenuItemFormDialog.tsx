"use client";

import type { FormEvent } from "react";

import {
  BADGE_LABELS,
  MANUAL_BADGES,
  type ManagedMenuCategory,
  type ManagedMenuItem,
  type ManualMenuBadge,
} from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input, Select, Textarea } from "@/shared/ui/input";

import {
  useCreateMenuItem,
  useUpdateMenuItem,
  type MenuItemBody,
} from "../api/use-menu-item-mutations";
import {
  newUntilFromInput,
  newUntilInputValue,
  todayInputValue,
} from "../lib/new-until";
import {
  POPULAR_MODES,
  popularModeOf,
  popularOverrideOf,
} from "../lib/popular-mode";

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
    manualBadges: data.getAll("manualBadges") as ManualMenuBadge[],
    newUntil: newUntilFromInput(String(data.get("newUntil") ?? "")),
    popularOverride: popularOverrideOf(String(data.get("popular") ?? "auto")),
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

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Метки</legend>
          <div className="flex flex-wrap gap-2">
            {MANUAL_BADGES.map((badge) => (
              <label
                key={badge}
                className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 has-checked:border-copper has-checked:bg-copper/15"
              >
                <input
                  type="checkbox"
                  name="manualBadges"
                  value={badge}
                  defaultChecked={item?.manualBadges.includes(badge)}
                  className="size-4 accent-copper"
                />
                {BADGE_LABELS[badge]}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Популярно</legend>
          <div className="grid grid-cols-3 gap-1 rounded-full border border-border p-1">
            {POPULAR_MODES.map((mode) => (
              <label
                key={mode.value}
                className="flex min-h-11 cursor-pointer items-center justify-center rounded-full px-4 has-checked:bg-copper has-checked:text-charcoal has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
              >
                <input
                  type="radio"
                  name="popular"
                  value={mode.value}
                  defaultChecked={
                    popularModeOf(item?.popularOverride) === mode.value
                  }
                  className="sr-only"
                />
                {mode.label}
              </label>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            «Авто» — по заказам за последние 30 дней
            {item &&
              (item.autoPopular
                ? ": сейчас позиция в популярных."
                : ": сейчас позиция не в популярных.")}
          </p>
        </fieldset>
        <Field
          label="Новинка до"
          htmlFor="item-new-until"
          hint="Пусто — без метки «Новинка». Новой позиции ставим две недели."
        >
          <Input
            id="item-new-until"
            name="newUntil"
            type="date"
            min={todayInputValue()}
            defaultValue={newUntilInputValue(item ? item.newUntil : undefined)}
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
