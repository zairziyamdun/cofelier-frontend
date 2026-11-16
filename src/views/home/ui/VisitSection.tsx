import Link from "next/link";

import { site } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

import { visit } from "../config/content";

export function VisitSection() {
  return (
    <section
      aria-labelledby="visit-title"
      className="relative isolate overflow-hidden bg-charcoal text-cream"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-60%] left-1/2 -z-10 size-[90vmax] -translate-x-1/2 hero-glow opacity-70"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grain"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-24 md:items-center md:py-40 md:text-center">
        <p className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm">
          {visit.eyebrow}
        </p>
        <h2
          id="visit-title"
          data-split
          className="font-heading text-[clamp(3rem,10vw,8rem)] leading-[0.95]"
        >
          {visit.title}
        </h2>
        <div data-reveal className="flex flex-col gap-2 text-lg text-cream/70">
          <p>
            {site.city}, {site.address}
          </p>
          <p>
            {site.hours.map((row) => `${row.days} ${row.time}`).join(" · ")}
          </p>
        </div>
        <span data-magnetic data-reveal className="inline-block">
          <Link
            href={visit.cta.href}
            className={cn(
              buttonVariants({ size: "lg" }),
              "min-h-12 rounded-full bg-copper px-8 text-base text-charcoal hover:bg-copper/85",
            )}
          >
            {visit.cta.label}
          </Link>
        </span>
      </div>
    </section>
  );
}
