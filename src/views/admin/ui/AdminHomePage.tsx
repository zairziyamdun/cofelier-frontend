import Link from "next/link";
import { Suspense } from "react";

import { roleLabels } from "@/entities/user";
import { sectionsForRole, STAFF_ROLES } from "@/shared/config";
import { requireUser } from "@/shared/session";

import { AdminPageSkeleton } from "./AdminPageGate";

export function AdminHomePage() {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const user = await requireUser({ from: "/admin", roles: STAFF_ROLES });
  const sections = sectionsForRole(user.role);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-3xl md:text-4xl">
          Здравствуйте, {user.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Роль: {roleLabels[user.role]}. Вам доступны разделы ниже.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {sections.map((section) => (
          <li key={section.href}>
            <Link
              href={section.href}
              className="flex h-full flex-col gap-2 rounded-xl border border-border bg-card p-6 hover:border-copper"
            >
              <span className="font-heading text-xl">{section.label}</span>
              <span className="text-sm text-muted-foreground">
                {section.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
