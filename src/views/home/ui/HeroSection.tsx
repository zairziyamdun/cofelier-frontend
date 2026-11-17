import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

import { hero } from "../config/content";

import { BeanSceneLazy } from "./BeanSceneLazy";

export function HeroSection() {
  return (
    <section
      data-hero
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[calc(100svh-6.5rem)] items-center overflow-hidden sm:min-h-[calc(100svh-4rem)]"
    >
      <BeanSceneLazy />
      {/* Затемнение под текстом: зёрна не мешают читать. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-charcoal/85 via-charcoal/40 to-transparent fade-bottom md:bg-linear-to-r md:from-charcoal/90 md:via-charcoal/40"
      />

      <div
        data-hero-content
        className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 self-start px-4 pt-16 pb-48 md:self-center md:py-24"
      >
        <p
          data-hero-fade
          className="hero-hidden text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
        >
          {hero.eyebrow}
        </p>
        <h1
          id="hero-title"
          data-hero-title
          className="hero-hidden max-w-[11ch] font-heading text-[clamp(2.5rem,13vw,7.5rem)] leading-[0.95] tracking-tight min-[360px]:text-[clamp(3rem,13vw,7.5rem)]"
        >
          {hero.title.before}{" "}
          <em className="text-copper italic">{hero.title.accent}</em>{" "}
          {hero.title.after}
        </h1>
        <p
          data-hero-fade
          className="hero-hidden max-w-md text-base text-cream/75 sm:text-lg"
        >
          {hero.lead}
        </p>
        <div data-hero-fade className="hero-hidden flex flex-wrap gap-4 pt-2">
          <span data-magnetic className="inline-block">
            <Link
              href={hero.primaryCta.href}
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-12 rounded-full bg-copper px-6 text-base text-charcoal hover:bg-copper/85 min-[360px]:px-8",
              )}
            >
              {hero.primaryCta.label}
            </Link>
          </span>
          <span data-magnetic className="inline-block">
            <Link
              href={hero.secondaryCta.href}
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-12 rounded-full border-cream/30 bg-transparent px-6 text-base text-cream hover:bg-cream/10 hover:text-cream min-[360px]:px-8",
              )}
            >
              {hero.secondaryCta.label}
            </Link>
          </span>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-[0.625rem] tracking-[0.3em] text-cream/50 uppercase"
      >
        {hero.scrollHint}
        <span className="relative block h-12 w-px overflow-hidden bg-cream/15">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-copper motion-safe:animate-[scroll-cue_2.2s_ease-in-out_infinite]" />
        </span>
      </div>
    </section>
  );
}
