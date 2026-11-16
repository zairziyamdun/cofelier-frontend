import Link from "next/link";
import { Suspense } from "react";

import { CartLink } from "@/features/cart";
import { navigation } from "@/shared/config";
import { Logo } from "@/shared/ui/logo";
import { NavLink } from "@/shared/ui/nav-link";

import { UserButton, UserButtonPlaceholder } from "./UserButton";

// На телефоне — две строки: логотип с корзиной и профилем, под ними разделы.
// С sm — всё в одну строку.
// Без backdrop-blur: при почти непрозрачном фоне размытие не видно, а под
// анимациями главной оно пересчитывается каждый кадр и съедает FPS.
export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/95">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:py-0">
        <Link
          href="/"
          aria-label="Cofelier — на главную"
          className="flex min-h-11 items-center"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Основное меню"
          className="order-last w-full sm:order-none sm:ml-auto sm:w-auto"
        >
          <ul className="flex items-center justify-between sm:gap-2">
            {navigation.map((link) => (
              <li key={link.href}>
                <NavLink
                  href={link.href}
                  className="flex min-h-11 items-center rounded-lg px-2 font-medium hover:bg-muted sm:px-4"
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-1">
          <CartLink />
          {/* Сессия известна только в браузере: кнопка не держит статическую оболочку. */}
          <Suspense fallback={<UserButtonPlaceholder />}>
            <UserButton />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
