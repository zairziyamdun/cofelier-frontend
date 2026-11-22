"use client";

import { useState, type FormEvent } from "react";

import type { ManagedModifierGroup } from "@/entities/menu-item";
import { Button } from "@/shared/ui/button";
import { Dialog } from "@/shared/ui/dialog";
import { Field, FormError, Input, Select } from "@/shared/ui/input";

import {
  useCreateGroup,
  useUpdateGroup,
  type GroupBody,
} from "../api/use-modifier-mutations";

type Kind = GroupBody["kind"];

export const KIND_LABELS: Record<Kind, string> = {
  single: "Один вариант",
  multiple: "Несколько вариантов",
  quantity: "Количеством",
};

const KIND_HINTS: Record<Kind, string> = {
  single: "Молоко, объём, сахар: гость выбирает один.",
  multiple: "Сиропы: можно несколько, до лимита.",
  quantity: "Доп. шот: гость указывает, сколько штук.",
};

// Новая группа или правка; варианты добавляются в карточке группы.
export function GroupFormDialog({
  open,
  group,
  onClose,
}: {
  open: boolean;
  group?: ManagedModifierGroup;
  onClose: () => void;
}) {
  const createGroup = useCreateGroup();
  const updateGroup = useUpdateGroup();
  const mutation = group ? updateGroup : createGroup;
  const [kind, setKind] = useState<Kind>(group?.kind ?? "single");

  function handleClose() {
    createGroup.reset();
    updateGroup.reset();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const max = String(data.get("maxSelect") ?? "");
    const body = {
      name: String(data.get("name") ?? ""),
      kind,
      required: data.get("required") === "on",
      maxSelect: kind === "single" || max === "" ? null : Number(max),
    };
    if (group) {
      updateGroup.mutate({ id: group.id, body }, { onSuccess: handleClose });
    } else {
      createGroup.mutate(body, { onSuccess: handleClose });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={group ? "Изменить группу" : "Новая группа добавок"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Название" htmlFor="group-name">
          <Input
            id="group-name"
            name="name"
            required
            minLength={2}
            maxLength={40}
            placeholder="Молоко"
            defaultValue={group?.name}
          />
        </Field>
        <Field
          label="Как выбирают"
          htmlFor="group-kind"
          hint={KIND_HINTS[kind]}
        >
          <Select
            id="group-kind"
            value={kind}
            onChange={(event) => setKind(event.currentTarget.value as Kind)}
          >
            {(Object.keys(KIND_LABELS) as Kind[]).map((value) => (
              <option key={value} value={value}>
                {KIND_LABELS[value]}
              </option>
            ))}
          </Select>
        </Field>
        {kind !== "single" && (
          <Field
            label={
              kind === "quantity"
                ? "Сколько штук всего"
                : "Сколько можно выбрать"
            }
            htmlFor="group-max"
            hint="Пусто — без ограничения."
          >
            <Input
              id="group-max"
              name="maxSelect"
              type="number"
              inputMode="numeric"
              min={1}
              max={20}
              step={1}
              defaultValue={group?.maxSelect ?? ""}
            />
          </Field>
        )}
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="required"
            defaultChecked={group?.required}
            className="size-4 accent-copper"
          />
          Обязательно выбрать — без этого товар не добавить
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
