import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

import { order } from "../config/content";

export function OrderSection() {
  return (
    // overflow-x-clip: шаги выезжают справа и до появления торчали бы за край экрана.
    <section aria-labelledby="order-title" className="overflow-x-clip">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 md:grid-cols-2 md:py-32">
        <div className="flex flex-col gap-6">
          <h2
            id="order-title"
            data-split
            className="font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-none"
          >
            {order.title}
          </h2>
          <p data-reveal className="max-w-sm text-lg text-muted-foreground">
            {order.text}
          </p>
          <span data-magnetic data-reveal className="inline-block self-start">
            <Link
              href={order.cta.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-12 rounded-full bg-copper px-8 text-base text-charcoal hover:bg-copper/85",
              )}
            >
              {order.cta.label}
            </Link>
          </span>
        </div>

        <ol data-order className="relative flex flex-col gap-10">
          {/* Линия соединяет кружки шагов и прорисовывается при прокрутке. */}
          <span
            aria-hidden="true"
            className="absolute top-6 bottom-6 left-6 w-px -translate-x-1/2 bg-border"
          >
            <span
              data-order-line
              className="block size-full origin-top bg-copper"
            />
          </span>
          {order.steps.map((step, index) => (
            <li
              key={step}
              data-order-step
              className="relative flex items-center gap-6"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-copper font-heading text-xl text-charcoal">
                {index + 1}
              </span>
              <span className="text-lg md:text-xl">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
