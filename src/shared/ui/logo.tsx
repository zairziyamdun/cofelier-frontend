import {
  MARK_CUP_PATH,
  MARK_NO_STEAM_VIEWBOX,
  MARK_STEAM_PATH,
  MARK_VIEWBOX,
} from "@/shared/brand";
import { cn } from "@/shared/lib/utils";

// Векторный знак бренда: буква C с чашкой — цветом текста (currentColor),
// пар — медный. Без пара (steam={false}) — как в favicon (app/icon.svg).
export function LogoMark({
  className,
  steam = true,
}: {
  className?: string;
  steam?: boolean;
}) {
  return (
    <svg
      viewBox={steam ? MARK_VIEWBOX : MARK_NO_STEAM_VIEWBOX}
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <path fill="currentColor" fillRule="evenodd" d={MARK_CUP_PATH} />
      {steam && (
        <path className="fill-copper" fillRule="evenodd" d={MARK_STEAM_PATH} />
      )}
    </svg>
  );
}

// На телефоне — только знак, с md — знак и слово.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className="size-9" />
      <span className="hidden font-heading text-2xl md:inline">Cofelier</span>
    </span>
  );
}
