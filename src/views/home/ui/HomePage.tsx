import Link from "next/link";

import { site } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { Hero } from "@/widgets/hero";

import { advantages, orderSteps } from "../config/content";

export function HomePage() {
  return (
    <main className="flex-1">
      <Hero />

      <section
        aria-labelledby="advantages-title"
        className="mx-auto max-w-6xl px-4 py-16"
      >
        <h2
          id="advantages-title"
          className="mb-8 font-heading text-3xl md:text-4xl"
        >
          Почему Cofelier
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {advantages.map((item) => (
            <li
              key={item.title}
              className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6"
            >
              <h3 className="font-heading text-xl text-copper">{item.title}</h3>
              <p className="text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="order-title" className="bg-muted">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <h2 id="order-title" className="font-heading text-3xl md:text-4xl">
              Закажите заранее
            </h2>
            <p className="text-muted-foreground">
              Онлайн-оплаты нет: вы платите при получении, наличными или картой.
            </p>
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 self-start px-6",
              )}
            >
              Выбрать в меню
            </Link>
          </div>
          <ol className="flex flex-col gap-4">
            {orderSteps.map((step, index) => (
              <li key={step} className="flex items-center gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-copper font-heading text-lg text-charcoal">
                  {index + 1}
                </span>
                <span className="text-lg">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-labelledby="visit-title"
        className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-16 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <h2 id="visit-title" className="font-heading text-3xl">
            Заходите в мастерскую
          </h2>
          <p className="mt-2 text-muted-foreground">
            {site.city}, {site.address} ·{" "}
            {site.hours.map((row) => `${row.days} ${row.time}`).join(", ")}
          </p>
        </div>
        <Link
          href="/contacts"
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "min-h-11 self-start px-6 md:self-auto",
          )}
        >
          Контакты и карта
        </Link>
      </section>
    </main>
  );
}
