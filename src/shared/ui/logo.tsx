import { cn } from "@/shared/lib/utils";

// Временный знак «C с чашкой»: заменить на SVG из готового логотипа бренда.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn("size-8 text-copper", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
    >
      <path d="M24 8.5A11 11 0 1 0 24 23.5" />
      <path d="M11 13h9v5a4.5 4.5 0 0 1-9 0z" />
      <path d="M20 14.5h1.5a2 2 0 0 1 0 4H20" />
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
