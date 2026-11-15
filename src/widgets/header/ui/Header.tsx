import Link from "next/link";

import { navigation } from "@/shared/config";
import { Logo } from "@/shared/ui/logo";

import { NavLink } from "./NavLink";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          aria-label="Cofelier — на главную"
          className="flex min-h-11 items-center"
        >
          <Logo />
        </Link>
        <nav aria-label="Основное меню">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navigation.map((link) => (
              <li key={link.href}>
                <NavLink href={link.href} label={link.label} />
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
