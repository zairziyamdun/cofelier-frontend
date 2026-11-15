import { cn } from "@/shared/lib/utils";

// Знак по мотивам логотипа (public/brand/cofelier-logo.png): буква C, в ней
// чашка, над чашкой пар. Без пара — для favicon (app/icon.svg).
export function LogoMark({
  className,
  steam = true,
}: {
  className?: string;
  steam?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 shrink-0", className)}
    >
      <path
        fill="currentColor"
        d="M25.9 6.1A14 14 0 1 0 25.9 25.9L23.07 23.07A10 10 0 1 1 23.07 8.93Z"
      />
      <path className="fill-copper" d="M10.5 14h10v2.5a5 5 0 0 1-10 0Z" />
      <path
        className="stroke-copper"
        fill="none"
        strokeWidth={1.4}
        strokeLinecap="round"
        d="M20.5 15h.8a1.8 1.8 0 0 1 0 3.6h-1.2"
      />
      {steam && (
        <path
          className="stroke-copper"
          fill="none"
          strokeWidth={1.3}
          strokeLinecap="round"
          d="M15.5 12.2c-1.1-1 1.1-1.9 0-3.2M17.8 12.2c-.8-.8.8-1.4 0-2.4"
        />
      )}
    </svg>
  );
}

// На телефоне — только знак, с md — знак и слово.
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="hidden font-heading text-2xl md:inline">Cofelier</span>
    </span>
  );
}
