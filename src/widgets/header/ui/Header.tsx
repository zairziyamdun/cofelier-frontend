import Link from "next/link";
import { Suspense } from "react";

import { navigation } from "@/shared/config";
import { Logo } from "@/shared/ui/logo";
import { NavLink } from "@/shared/ui/nav-link";

import { UserButton, UserButtonPlaceholder } from "./UserButton";

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
        <div className="flex items-center gap-1">
          <nav aria-label="Основное меню">
            <ul className="flex items-center sm:gap-2">
              {navigation.map((link) => (
                <li key={link.href}>
                  <NavLink
                    href={link.href}
                    className="flex min-h-11 items-center rounded-lg px-2 text-sm font-medium hover:bg-muted sm:px-4 sm:text-base"
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          {/* Сессия известна только в браузере: кнопка не держит статическую оболочку. */}
          <Suspense fallback={<UserButtonPlaceholder />}>
            <UserButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
