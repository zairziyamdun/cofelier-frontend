"use client";

import type { ManagedMenuItem } from "@/entities/menu-item";
import { Switch } from "@/shared/ui/switch";

import { useSetStopList } from "../api/use-stop-list";

// Включён — позиция в продаже; выключен — в стоп-листе.
export function StopListSwitch({ item }: { item: ManagedMenuItem }) {
  const setStopList = useSetStopList();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={!item.inStopList}
        label={`${item.name}: в продаже`}
        disabled={setStopList.isPending}
        onCheckedChange={(available) =>
          setStopList.mutate({ id: item.id, inStopList: !available })
        }
      />
      <span
        className={
          item.inStopList ? "text-sm text-muted-foreground" : "text-sm"
        }
      >
        {item.inStopList ? "Стоп-лист" : "В продаже"}
      </span>
      {setStopList.isError && (
        <span role="alert" className="text-sm text-destructive">
          Не сохранилось
        </span>
      )}
    </div>
  );
}
