import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { connection } from "next/server";
import { Suspense } from "react";

import { popularMenuQueryOptions } from "@/entities/menu-item";
import { getQueryClient } from "@/shared/api";

import { POPULAR_FETCH_LIMIT } from "../config/popular";

import { PopularRail } from "./PopularRail";
import { PopularSkeleton } from "./PopularSkeleton";

// Витрина «Любимое гостей»: самые заказываемые напитки из API.
export function PopularSection() {
  return (
    <section
      data-popular
      aria-labelledby="popular-title"
      className="relative isolate overflow-x-clip"
    >
      <Suspense fallback={<PopularSkeleton />}>
        <PopularData />
      </Suspense>
    </section>
  );
}

// Данные грузятся на сервере на каждый запрос и уходят в кеш TanStack Query.
async function PopularData() {
  // Без этого Next попробует запросить API во время сборки (cacheComponents).
  await connection();
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(popularMenuQueryOptions(POPULAR_FETCH_LIMIT));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PopularRail />
    </HydrationBoundary>
  );
}
