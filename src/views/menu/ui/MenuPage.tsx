import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";
import { Suspense } from "react";

import { publicMenuQueryOptions } from "@/entities/menu-item";
import { getQueryClient } from "@/shared/api";
import { MenuListSkeleton } from "@/widgets/menu-list";

import { MenuScreen } from "./MenuScreen";

export function MenuPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">
      <header className="mb-8">
        <h1 className="font-heading text-4xl md:text-5xl">Меню</h1>
        <p className="mt-2 text-muted-foreground">
          Обжариваем сами, варим при вас. Оплата при получении.
        </p>
      </header>
      <Suspense fallback={<MenuListSkeleton />}>
        <MenuData />
      </Suspense>
    </main>
  );
}

// Меню грузится на сервере при каждом запросе и передаётся в кеш TanStack Query.
async function MenuData() {
  // Без этого Next попробует запросить API во время сборки (cacheComponents).
  await connection();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(publicMenuQueryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MenuScreen />
    </HydrationBoundary>
  );
}
