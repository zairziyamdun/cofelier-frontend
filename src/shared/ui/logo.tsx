import {
  MARK_CUP_PATH,
  MARK_INLINE_VIEWBOX,
  MARK_NO_STEAM_VIEWBOX,
  MARK_STEAM_PATH,
} from "@/shared/brand";
import { cn } from "@/shared/lib/utils";

// Векторный знак бренда: буква C с чашкой — цветом текста (currentColor),
// пар — медный. Рамка центрирована на букве C, поэтому рядом со словом в
// flex-ряду с items-center знак стоит ровно. steam={false} — без пара.
export function LogoMark({
  className,
  steam = true,
}: {
  className?: string;
  steam?: boolean;
}) {
  return (
    <svg
      viewBox={steam ? MARK_INLINE_VIEWBOX : MARK_NO_STEAM_VIEWBOX}
      aria-hidden="true"
      className={cn("size-10 shrink-0", className)}
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
      <LogoMark className="size-11" />
      <span className="hidden font-heading text-2xl md:inline">Cofelier</span>
    </span>
  );
}
