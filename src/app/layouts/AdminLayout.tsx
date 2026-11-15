import { Suspense, type ReactNode } from "react";

import { STAFF_ROLES } from "@/shared/config";
import { requireUser } from "@/shared/session";
import { AdminSidebar } from "@/widgets/admin-sidebar";

// Каркас панели (группа (admin)): боковое меню по роли пользователя.
// Сессия читается под Suspense, а не на верхнем уровне layout (cacheComponents).
export function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: ReactNode }) {
  const user = await requireUser({ from: "/admin", roles: STAFF_ROLES });

  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <AdminSidebar user={user} />
      <main className="min-w-0 flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  );
}

function AdminShellSkeleton() {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <div className="h-28 bg-charcoal md:h-dvh md:w-64" />
      <div className="flex-1" />
    </div>
  );
}
