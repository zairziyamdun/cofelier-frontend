import { Pencil, Trash2 } from "lucide-react";

import { formatPrice, type ManagedMenuItem } from "@/entities/menu-item";
import { StopListSwitch } from "@/features/menu-admin/stop-list";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import type { EditorActions } from "../model/editor-state";

export function MenuItemRow({
  item,
  actions,
}: {
  item: ManagedMenuItem;
  actions: EditorActions;
}) {
  return (
    <li className="flex flex-col gap-2 p-4 md:grid md:grid-cols-[1fr_auto_auto_auto] md:items-center md:gap-6">
      <div className={cn("min-w-0", item.inStopList && "opacity-60")}>
        <p className="font-medium">{item.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {[item.portion, item.description].filter(Boolean).join(" · ") ||
            "Без описания"}
        </p>
      </div>
      <span className="font-semibold text-copper md:w-24 md:text-right">
        {formatPrice(item.price)}
      </span>
      <StopListSwitch item={item} />
      <div className="flex gap-1 md:justify-end">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11"
          aria-label={`Изменить «${item.name}»`}
          onClick={() => actions.editItem(item)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-11 text-destructive"
          aria-label={`Удалить «${item.name}»`}
          onClick={() => actions.deleteItem(item)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    </li>
  );
}
