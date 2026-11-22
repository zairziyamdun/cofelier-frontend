"use client";

import { Minus, Plus } from "lucide-react";

import {
  groupRemaining,
  type ModifierGroup,
  type ModifierOption,
  type Selection,
  setOptionQuantity,
  toggleOption,
} from "@/entities/menu-item";
import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

// Группы добавок в шторке: «один» — плашки как переключатель, «несколько» —
// плашки-флажки, «количеством» — счётчики. Закончившиеся видны, но неактивны.
export function ModifierPicker({
  groups,
  selection,
  errors,
  onChange,
}: {
  groups: ModifierGroup[];
  selection: Selection;
  errors: ReadonlyMap<number, string>;
  onChange: (next: Selection) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <fieldset key={group.id} className="flex flex-col gap-2">
          <legend className="mb-2 flex w-full items-baseline justify-between gap-2">
            <span className="font-medium">{group.name}</span>
            <span className="text-xs text-muted-foreground">
              {groupHint(group)}
            </span>
          </legend>
          {group.kind === "quantity" ? (
            <ul className="flex flex-col gap-2">
              {group.options.map((option) => (
                <QuantityOption
                  key={option.id}
                  group={group}
                  option={option}
                  selection={selection}
                  onChange={onChange}
                />
              ))}
            </ul>
          ) : (
            <div
              role={group.kind === "single" ? "radiogroup" : "group"}
              aria-label={group.name}
              className="flex flex-wrap gap-2"
            >
              {group.options.map((option) => {
                const selected = selection.has(option.id);
                const full =
                  group.kind === "multiple" &&
                  !selected &&
                  groupRemaining(group, selection) <= 0;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role={group.kind === "single" ? "radio" : "checkbox"}
                    aria-checked={selected}
                    disabled={!option.isAvailable || full}
                    onClick={() =>
                      onChange(toggleOption(group, option.id, selection))
                    }
                    className={cn(
                      "flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm transition-colors disabled:opacity-45",
                      selected
                        ? "border-copper bg-copper text-charcoal"
                        : "border-border hover:bg-muted",
                    )}
                  >
                    <span>{option.name}</span>
                    <OptionMeta option={option} selected={selected} />
                  </button>
                );
              })}
            </div>
          )}
          {errors.get(group.id) && (
            <p role="alert" className="text-sm text-destructive">
              {errors.get(group.id)}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}

function QuantityOption({
  group,
  option,
  selection,
  onChange,
}: {
  group: ModifierGroup;
  option: ModifierOption;
  selection: Selection;
  onChange: (next: Selection) => void;
}) {
  const count = selection.get(option.id) ?? 0;
  const set = (value: number) =>
    onChange(setOptionQuantity(group, option.id, value, selection));
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-sm">
        {option.name} <OptionMeta option={option} selected={false} />
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label={`Меньше: ${option.name}`}
          disabled={count === 0}
          onClick={() => set(count - 1)}
        >
          <Minus aria-hidden="true" />
        </Button>
        <span
          aria-live="polite"
          aria-label={`${option.name}: ${count}`}
          className="w-8 text-center font-medium tabular-nums"
        >
          {count}
        </span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11"
          aria-label={`Больше: ${option.name}`}
          disabled={
            !option.isAvailable || groupRemaining(group, selection) <= 0
          }
          onClick={() => set(count + 1)}
        >
          <Plus aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}

function OptionMeta({
  option,
  selected,
}: {
  option: ModifierOption;
  selected: boolean;
}) {
  const parts = [
    option.priceDelta > 0 ? `+${formatPrice(option.priceDelta)}` : null,
    option.note,
    option.isAvailable ? null : "нет",
  ].filter(Boolean);
  if (parts.length === 0) return null;
  return (
    <span
      className={cn(
        "text-xs",
        selected ? "text-charcoal/75" : "text-muted-foreground",
      )}
    >
      {parts.join(" · ")}
    </span>
  );
}

function groupHint(group: ModifierGroup): string {
  if (group.kind === "single") return group.required ? "обязательно" : "";
  const limit = group.maxSelect === null ? "" : `до ${group.maxSelect}`;
  return [group.required ? "обязательно" : "", limit]
    .filter(Boolean)
    .join(", ");
}
