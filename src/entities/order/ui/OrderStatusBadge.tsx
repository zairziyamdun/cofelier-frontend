import { cn } from "@/shared/lib/utils";

import { statusLabels } from "../lib/status";
import type { OrderStatus } from "../model/types";

const tones: Record<OrderStatus, string> = {
  new: "bg-copper text-charcoal",
  accepted: "bg-accent text-accent-foreground",
  preparing: "bg-accent text-accent-foreground",
  ready: "bg-primary text-primary-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground line-through",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-4 py-1 text-sm font-medium whitespace-nowrap",
        tones[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
