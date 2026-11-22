"use client";

import { type ManagedMenuItem, useModifierGroups } from "@/entities/menu-item";
import { FormError } from "@/shared/ui/input";

import { useSetItemGroups } from "../api/use-item-modifier-groups";

// Группы добавок товара — флажками, сохраняется сразу. Порядок в шторке —
// порядок, в котором группы отмечены: новая встаёт в конец.
// Кнопки — type="button": блок живёт внутри формы позиции.
export function ItemModifierGroups({ item }: { item: ManagedMenuItem }) {
  const groups = useModifierGroups();
  const setGroups = useSetItemGroups(item.id);
  const attached = item.modifierGroups.map((group) => group.id);

  const toggle = (groupId: number) => {
    const next = attached.includes(groupId)
      ? attached.filter((id) => id !== groupId)
      : [...attached, groupId];
    setGroups.mutate(next);
  };

  return (
    <fieldset
      className="flex flex-col gap-2"
      disabled={setGroups.isPending || groups.isPending}
    >
      <legend className="mb-2 text-sm font-medium">Добавки</legend>
      {groups.data?.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Групп добавок пока нет — заведите их в разделе «Добавки» ниже.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {groups.data?.map((group) => {
          const position = attached.indexOf(group.id);
          return (
            <label
              key={group.id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border px-4 has-checked:border-copper has-checked:bg-copper/15"
            >
              <input
                type="checkbox"
                checked={position >= 0}
                onChange={() => toggle(group.id)}
                className="size-4 accent-copper"
              />
              {position >= 0 && (
                <span className="text-xs text-muted-foreground">
                  {position + 1}.
                </span>
              )}
              {group.name}
            </label>
          );
        })}
      </div>
      <FormError error={setGroups.error ?? groups.error} />
    </fieldset>
  );
}
