import Image from "next/image";
import Link from "next/link";

import { brandLogo } from "@/shared/brand";
import { site } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

export function Hero() {
  return (
    <section className="bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:py-24">
        <div className="flex flex-col gap-6">
          <p className="text-sm tracking-[0.2em] text-copper uppercase">
            Кофейня со своей обжаркой
          </p>
          <h1 className="font-heading text-4xl leading-tight md:text-6xl">
            {site.slogan}
          </h1>
          <p className="max-w-md text-lg text-cream/80">
            Обжариваем зерно небольшими партиями и варим так, как нравится
            именно вам. Закажите заранее — заберёте без очереди.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/menu"
              className={cn(
                buttonVariants({ size: "lg" }),
                "min-h-11 bg-copper px-6 text-charcoal hover:bg-copper/85",
              )}
            >
              Смотреть меню
            </Link>
            <Link
              href="/contacts"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 border-cream/30 bg-transparent px-6 text-cream hover:bg-cream/10 hover:text-cream",
              )}
            >
              Как нас найти
            </Link>
          </div>
        </div>
        <Image
          src={brandLogo}
          alt="Логотип Cofelier: буква C с чашкой кофе"
          priority
          placeholder="blur"
          sizes="(min-width: 768px) 50vw, 100vw"
          className="h-auto w-full rounded-2xl"
        />
      </div>
    </section>
  );
}
