"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type NavLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  // exact — подсвечивать только на самом адресе, без вложенных (/admin).
  exact?: boolean;
};

// Клиентская ссылка ради подсветки текущего раздела и aria-current.
export function NavLink({
  href,
  children,
  className,
  activeClassName = "text-copper",
  exact = false,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = exact
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
