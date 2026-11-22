import type { ReactNode } from "react";

import { formatPrice } from "@/shared/lib/format-price";
import { cn } from "@/shared/lib/utils";

import type { MenuItem } from "../model/types";

import { MenuItemBadges } from "./MenuItemBadges";

// action — слот под кнопку из слоя выше (например, «В корзину»):
// сущность меню не знает о корзине.
export function MenuItemCard({
  item,
  action,
}: {
  item: MenuItem;
  action?: ReactNode;
}) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-card-foreground",
        !item.isAvailable && "opacity-60",
      )}
    >
      <MenuItemBadges badges={item.badges} />
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-xl">{item.name}</h3>
        <span className="shrink-0 font-semibold text-copper">
          {formatPrice(item.price)}
        </span>
      </div>
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}
      <div className="mt-auto flex min-h-11 items-center justify-between gap-2 pt-2 text-sm">
        <span className="text-muted-foreground">{item.portion}</span>
        {item.isAvailable ? (
          action
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Нет в наличии
          </span>
        )}
      </div>
    </article>
  );
}
