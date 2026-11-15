import { Suspense, type ReactNode } from "react";

import { sectionRoles, type AdminSection } from "@/shared/config";
import { requireUser } from "@/shared/session";

// Layout панели не защищает страницы (они рендерятся параллельно с ним),
// поэтому каждая страница раздела сама проверяет роль.
export function AdminPageGate({
  href,
  children,
}: {
  href: AdminSection["href"];
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminPageSkeleton />}>
      <Gate href={href}>{children}</Gate>
    </Suspense>
  );
}

async function Gate({
  href,
  children,
}: {
  href: AdminSection["href"];
  children: ReactNode;
}) {
  await requireUser({ from: href, roles: sectionRoles(href) });
  return children;
}

export function AdminPageSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      <div className="h-10 w-56 rounded-lg bg-muted" />
      <div className="h-24 max-w-xl rounded-xl bg-muted" />
    </div>
  );
}
