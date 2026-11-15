import Link from "next/link";

import { Logo } from "@/shared/ui/logo";

// Остальные разделы (О нас, Контакты, корзина) появятся вместе со страницами.
const navigation = [{ href: "/menu", label: "Меню" }];

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          aria-label="Cofelier — на главную"
          className="flex min-h-11 items-center"
        >
          <Logo />
        </Link>
        <nav aria-label="Основное меню">
          <ul className="flex items-center gap-2">
            {navigation.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center rounded-lg px-4 font-medium hover:bg-muted"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
