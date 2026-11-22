import { cn } from "@/shared/lib/utils";

import { BADGE_LABELS, PRIMARY_BADGES } from "../config/badges";
import type { MenuItemBadge } from "../model/types";

// tone="dark" — для тёмных секций главной, где фон не из темы сайта.
export function MenuItemBadges({
  badges,
  tone = "default",
  className,
}: {
  badges: MenuItemBadge[];
  tone?: "default" | "dark";
  className?: string;
}) {
  if (badges.length === 0) return null;
  return (
    <ul aria-label="Метки" className={cn("flex flex-wrap gap-1", className)}>
      {badges.map((badge) => (
        <li
          key={badge}
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            PRIMARY_BADGES.has(badge)
              ? "bg-copper text-charcoal"
              : tone === "dark"
                ? "border border-cream/25 text-cream/85"
                : "border border-border bg-muted text-foreground",
          )}
        >
          {BADGE_LABELS[badge]}
        </li>
      ))}
    </ul>
  );
}
