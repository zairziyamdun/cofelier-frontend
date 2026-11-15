import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

export function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h1 className="font-heading text-5xl">Cofelier</h1>
      <p className="text-lg text-copper">Мастерская вашего кофе</p>
      <Link
        href="/menu"
        className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-6")}
      >
        Смотреть меню
      </Link>
    </main>
  );
}
