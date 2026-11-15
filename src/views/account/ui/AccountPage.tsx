import Link from "next/link";
import { Suspense } from "react";

import { isStaff, roleLabels } from "@/entities/user";
import { LogoutButton } from "@/features/auth/logout";
import { requireUser } from "@/shared/session";
import { MyOrders } from "@/widgets/my-orders";

export function AccountPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-heading text-4xl">Личный кабинет</h1>
      <Suspense
        fallback={
          <div className="mt-8 h-40 animate-pulse rounded-xl bg-muted" />
        }
      >
        <AccountContent />
      </Suspense>
    </main>
  );
}

async function AccountContent() {
  const user = await requireUser({ from: "/account" });

  return (
    <div className="mt-8 flex flex-col gap-8">
      <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">{roleLabels[user.role]}</p>
        <p className="font-heading text-2xl">{user.name}</p>
        <p className="text-muted-foreground">{user.email}</p>
        {isStaff(user.role) && (
          <Link
            href="/admin"
            className="flex min-h-11 items-center self-start font-medium text-copper hover:underline"
          >
            Перейти в панель
          </Link>
        )}
      </section>

      {!isStaff(user.role) && (
        <section aria-labelledby="orders-title" className="flex flex-col gap-4">
          <h2 id="orders-title" className="font-heading text-2xl">
            Мои заказы
          </h2>
          <MyOrders />
        </section>
      )}

      <LogoutButton className="self-start" />
    </div>
  );
}
