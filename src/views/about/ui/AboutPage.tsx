import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

import { craft, facts, story } from "../config/content";

export function AboutPage() {
  return (
    <main className="flex-1">
      <section className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-sm tracking-[0.2em] text-copper uppercase">О нас</p>
        <h1 className="mt-2 font-heading text-4xl md:text-5xl">
          Кофейня-мастерская со своей обжаркой
        </h1>
        <div className="mt-6 flex flex-col gap-4 text-lg text-muted-foreground">
          {story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section aria-labelledby="craft-title" className="bg-charcoal text-cream">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2
            id="craft-title"
            className="mb-8 font-heading text-3xl md:text-4xl"
          >
            Как мы работаем
          </h2>
          <ol className="grid gap-8 md:grid-cols-3">
            {craft.map((step, index) => (
              <li key={step.title} className="flex flex-col gap-2">
                <span className="font-heading text-5xl text-copper">
                  0{index + 1}
                </span>
                <h3 className="font-heading text-2xl">{step.title}</h3>
                <p className="text-cream/75">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        aria-label="Cofelier в цифрах"
        className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-3"
      >
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col gap-2 rounded-xl border border-border bg-card p-6"
          >
            <span className="font-heading text-4xl text-copper">
              {fact.value}
            </span>
            <span className="text-muted-foreground">{fact.label}</span>
          </div>
        ))}
      </section>

      <section className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 pb-16">
        <h2 className="font-heading text-3xl">Попробуйте сами</h2>
        <Link
          href="/menu"
          className={cn(buttonVariants({ size: "lg" }), "min-h-11 px-6")}
        >
          Смотреть меню
        </Link>
      </section>
    </main>
  );
}
