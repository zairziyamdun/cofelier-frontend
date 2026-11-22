"use client";

import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  type ManagedModifierGroup,
  useModifierGroups,
} from "@/entities/menu-item";
import { formatPrice } from "@/shared/lib/format-price";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";

import {
  useDeleteOption,
  useUpdateOption,
} from "../api/use-modifier-mutations";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { GroupFormDialog, KIND_LABELS } from "./GroupFormDialog";
import { OptionFormDialog } from "./OptionFormDialog";

type Option = ManagedModifierGroup["options"][number];
type Dialogs =
  | { kind: "group"; group?: ManagedModifierGroup }
  | { kind: "delete-group"; group: ManagedModifierGroup }
  | { kind: "option"; group: ManagedModifierGroup; option?: Option }
  | null;

// Раздел «Добавки»: группы заводятся один раз, к товарам подключаются в их форме.
export function ModifierGroupsSection() {
  const groups = useModifierGroups();
  const [dialog, setDialog] = useState<Dialogs>(null);
  const close = () => setDialog(null);

  return (
    <section aria-labelledby="modifiers-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="modifiers-title"
            className="font-heading text-2xl md:text-3xl"
          >
            Добавки
          </h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Молоко, сиропы, объём, сахар. Закончилось — выключите вариант: гость
            увидит его, но выбрать не сможет. К товару группы подключаются в его
            форме.
          </p>
        </div>
        <Button
          type="button"
          className="min-h-11 px-4"
          onClick={() => setDialog({ kind: "group" })}
        >
          <Plus aria-hidden="true" />
          Новая группа
        </Button>
      </div>

      {groups.isPending && (
        <div
          role="status"
          aria-label="Загружаем добавки"
          className="h-32 animate-pulse rounded-xl bg-muted"
        />
      )}
      {groups.isError && (
        <p className="rounded-xl border border-border p-4">
          Не получилось загрузить добавки: {groups.error.message}
        </p>
      )}
      {groups.data?.length === 0 && (
        <p className="rounded-xl border border-dashed border-border p-6 text-muted-foreground">
          Добавок пока нет. Начните с группы «Молоко» или «Объём».
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.data?.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onEdit={() => setDialog({ kind: "group", group })}
            onDelete={() => setDialog({ kind: "delete-group", group })}
            onAddOption={() => setDialog({ kind: "option", group })}
            onEditOption={(option) =>
              setDialog({ kind: "option", group, option })
            }
          />
        ))}
      </div>

      <GroupFormDialog
        // key — окно каждый раз с полями своей группы.
        key={dialog?.kind === "group" ? (dialog.group?.id ?? "new") : "closed"}
        open={dialog?.kind === "group"}
        group={dialog?.kind === "group" ? dialog.group : undefined}
        onClose={close}
      />
      <DeleteGroupDialog
        group={dialog?.kind === "delete-group" ? dialog.group : null}
        onClose={close}
      />
      <OptionFormDialog
        open={dialog?.kind === "option"}
        group={dialog?.kind === "option" ? dialog.group : null}
        option={dialog?.kind === "option" ? dialog.option : undefined}
        onClose={close}
      />
    </section>
  );
}

function GroupCard({
  group,
  onEdit,
  onDelete,
  onAddOption,
  onEditOption,
}: {
  group: ManagedModifierGroup;
  onEdit: () => void;
  onDelete: () => void;
  onAddOption: () => void;
  onEditOption: (option: Option) => void;
}) {
  const updateOption = useUpdateOption();
  const deleteOption = useDeleteOption();
  const limit =
    group.kind !== "single" && group.maxSelect !== null
      ? `, до ${group.maxSelect}`
      : "";

  return (
    <article className="flex flex-col rounded-xl border border-border bg-card">
      <header className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <h3 className="font-medium">{group.name}</h3>
          <p className="text-sm text-muted-foreground">
            {KIND_LABELS[group.kind]}
            {limit}
            {group.required && " · обязательно"} · у {group.itemIds.length} поз.
          </p>
        </div>
        <div className="flex shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11"
            aria-label={`Изменить группу «${group.name}»`}
            onClick={onEdit}
          >
            <Pencil aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-11 text-destructive"
            aria-label={`Удалить группу «${group.name}»`}
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      </header>

      <ul className="divide-y divide-border border-t border-border">
        {group.options.map((option) => (
          <li key={option.id} className="flex items-center gap-2 px-4 py-1">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 text-sm">
                {option.isDefault && (
                  <Star
                    aria-label="по умолчанию"
                    className="size-3.5 shrink-0 fill-copper text-copper"
                  />
                )}
                <span
                  className={
                    option.inStopList
                      ? "text-muted-foreground line-through"
                      : ""
                  }
                >
                  {option.name}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {[
                  option.priceDelta > 0
                    ? `+${formatPrice(option.priceDelta)}`
                    : "бесплатно",
                  option.note,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <Switch
              checked={!option.inStopList}
              label={`${option.name}: в наличии`}
              disabled={updateOption.isPending}
              onCheckedChange={(available) =>
                updateOption.mutate({
                  id: option.id,
                  body: { inStopList: !available },
                })
              }
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label={`Изменить «${option.name}»`}
              onClick={() => onEditOption(option)}
            >
              <Pencil aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 text-destructive"
              aria-label={`Удалить «${option.name}»`}
              disabled={deleteOption.isPending}
              onClick={() => {
                if (window.confirm(`Удалить вариант «${option.name}»?`)) {
                  deleteOption.mutate(option.id);
                }
              }}
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>

      <div className="mt-auto p-2">
        <Button
          type="button"
          variant="ghost"
          className="min-h-11 w-full"
          onClick={onAddOption}
        >
          <Plus aria-hidden="true" />
          Вариант
        </Button>
        {(updateOption.isError || deleteOption.isError) && (
          <p role="alert" className="px-2 text-sm text-destructive">
            {(updateOption.error ?? deleteOption.error)?.message}
          </p>
        )}
      </div>
    </article>
  );
}
