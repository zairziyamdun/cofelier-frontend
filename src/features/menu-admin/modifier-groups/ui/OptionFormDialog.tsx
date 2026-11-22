"use client";

import type { FormEvent } from "react";

import type { ManagedModifierGroup } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input } from "@/shared/ui/input";

import { useAddOption, useUpdateOption } from "../api/use-modifier-mutations";

type Option = ManagedModifierGroup["options"][number];

// Вариант группы: название, надбавка, подпись, «по умолчанию».
export function OptionFormDialog({
  open,
  group,
  option,
  onClose,
}: {
  open: boolean;
  group: ManagedModifierGroup | null;
  option?: Option;
  onClose: () => void;
}) {
  const addOption = useAddOption();
  const updateOption = useUpdateOption();
  const mutation = option ? updateOption : addOption;

  function handleClose() {
    addOption.reset();
    updateOption.reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!group) return;
    const data = new FormData(event.currentTarget);
    const body = {
      name: String(data.get("name") ?? ""),
      priceDelta: Number(data.get("priceDelta") || 0),
      note: String(data.get("note") ?? ""),
      isDefault: data.get("isDefault") === "on",
    };
    if (option) {
      updateOption.mutate({ id: option.id, body }, { onSuccess: handleClose });
    } else {
      addOption.mutate({ groupId: group.id, body }, { onSuccess: handleClose });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={
        option
          ? "Изменить вариант"
          : `Новый вариант${group ? ` — ${group.name}` : ""}`
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Название" htmlFor="option-name">
          <Input
            id="option-name"
            name="name"
            required
            maxLength={40}
            placeholder="Овсяное"
            defaultValue={option?.name}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Надбавка, ₸"
            htmlFor="option-price"
            hint="0 — бесплатно."
          >
            <Input
              id="option-price"
              name="priceDelta"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={option?.priceDelta ?? 0}
            />
          </Field>
          <Field
            label="Подпись"
            htmlFor="option-note"
            hint="Необязательно: «+150 мл»."
          >
            <Input
              id="option-note"
              name="note"
              maxLength={30}
              defaultValue={option?.note ?? ""}
            />
          </Field>
        </div>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="isDefault"
            defaultChecked={option?.isDefault}
            className="size-4 accent-copper"
          />
          По умолчанию — «+» в меню добавляет с этим вариантом
        </label>

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
