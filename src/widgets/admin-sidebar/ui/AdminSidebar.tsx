import Link from "next/link";

import { roleLabels, type User } from "@/entities/user";
import { LogoutButton } from "@/features/auth/logout";
import { sectionsForRole } from "@/shared/config";
import { LogoMark } from "@/shared/ui/logo";
import { NavLink } from "@/shared/ui/nav-link";

const linkClass =
  "flex min-h-11 items-center rounded-lg px-4 font-medium whitespace-nowrap text-cream/80 hover:bg-cream/10 hover:text-cream";

// Пункты — только разделы, открытые роли пользователя (adminSections).
export function AdminSidebar({ user }: { user: User }) {
  const sections = sectionsForRole(user.role);

  return (
    <aside className="bg-charcoal text-cream md:sticky md:top-0 md:flex md:h-dvh md:w-64 md:shrink-0 md:flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <Link href="/admin" className="flex min-h-11 items-center gap-2">
          <LogoMark className="text-cream" />
          <span className="font-heading text-xl">Панель</span>
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center text-sm text-cream/70 hover:text-cream md:hidden"
        >
          На сайт
        </Link>
      </div>

      <nav
        aria-label="Разделы панели"
        className="overflow-x-auto px-2 md:flex-1"
      >
        <ul className="flex gap-1 pb-2 md:flex-col md:pb-0">
          <li>
            <NavLink
              href="/admin"
              exact
              className={linkClass}
              activeClassName="bg-cream/10 text-cream"
            >
              Обзор
            </NavLink>
          </li>
          {sections.map((section) => (
            <li key={section.href}>
              <NavLink
                href={section.href}
                className={linkClass}
                activeClassName="bg-cream/10 text-cream"
              >
                {section.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="hidden flex-col gap-2 border-t border-cream/10 p-4 md:flex">
        <p className="truncate font-medium">{user.name}</p>
        <p className="text-sm text-cream/60">{roleLabels[user.role]}</p>
        <LogoutButton className="border-cream/20 bg-transparent text-cream hover:bg-cream/10 hover:text-cream" />
        <Link
          href="/"
          className="flex min-h-11 items-center justify-center text-sm text-cream/70 hover:text-cream"
        >
          На сайт
        </Link>
      </div>
    </aside>
  );
}
