"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/shared/lib/utils";

// Клиентский только ради подсветки текущего раздела.
export function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex min-h-11 items-center rounded-lg px-2 font-medium hover:bg-muted sm:px-4",
        isActive && "text-copper",
      )}
    >
      {label}
    </Link>
  );
}
