import { LogoMark } from "@/shared/ui/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="font-heading text-xl">Cofelier</span>
        </div>
        <p className="text-sm opacity-80">
          Мастерская вашего кофе · оплата при получении
        </p>
      </div>
    </footer>
  );
}
