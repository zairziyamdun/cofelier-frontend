import { cn } from "@/shared/lib/utils";

import { formatPrice } from "../lib/format-price";
import type { MenuItem } from "../model/types";

export function MenuItemCard({ item }: { item: MenuItem }) {
  return (
    <article
      className={cn(
        "flex flex-col gap-2 rounded-xl border border-border bg-card p-4 text-card-foreground",
        !item.isAvailable && "opacity-60",
      )}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-heading text-xl">{item.name}</h3>
        <span className="shrink-0 font-semibold text-copper">
          {formatPrice(item.price)}
        </span>
      </div>
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-sm">
        <span className="text-muted-foreground">{item.portion}</span>
        {!item.isAvailable && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Нет в наличии
          </span>
        )}
      </div>
    </article>
  );
}
