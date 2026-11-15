import { OrderLines, type StaffOrder } from "@/entities/order";
import { OrderStatusActions } from "@/features/order-status";
import { formatTime } from "@/shared/lib/format-time";
import { cn } from "@/shared/lib/utils";

export function OrderCard({
  order,
  highlighted,
}: {
  order: StaffOrder;
  highlighted: boolean;
}) {
  return (
    <article
      aria-labelledby={`order-${order.id}`}
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-4 transition-shadow",
        highlighted ? "border-copper shadow-lg" : "border-border",
      )}
    >
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 id={`order-${order.id}`} className="font-heading text-xl">
            № {order.id} ·{" "}
            <span className="break-words">{order.customerName}</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            создан в {formatTime(order.createdAt)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-1 text-sm font-medium",
            order.pickupAt ? "bg-accent" : "bg-copper text-charcoal",
          )}
        >
          {order.pickupAt ? `к ${formatTime(order.pickupAt)}` : "сразу"}
        </span>
      </header>
      <OrderLines order={order} />
      {order.comment && (
        <p className="rounded-lg bg-muted p-2 text-sm">«{order.comment}»</p>
      )}
      <OrderStatusActions order={order} />
    </article>
  );
}
