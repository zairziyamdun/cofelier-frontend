import Link from "next/link";

import { navigation, phoneHref, site } from "@/shared/config";
import { LogoMark } from "@/shared/ui/logo";

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Link
            href="/"
            className="flex min-h-11 items-center gap-2 self-start"
          >
            <LogoMark />
            <span className="font-heading text-2xl">{site.name}</span>
          </Link>
          <p className="text-sm text-cream/70">
            {site.slogan}. Оплата при получении.
          </p>
        </div>

        <nav aria-label="Разделы сайта">
          <ul className="flex flex-col">
            {navigation.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="flex min-h-11 items-center hover:text-copper"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <address className="flex flex-col gap-2 text-sm not-italic">
          <span>
            {site.city}, {site.address}
          </span>
          {site.hours.map((row) => (
            <span key={row.days} className="text-cream/70">
              {row.days}: {row.time}
            </span>
          ))}
          <a
            href={phoneHref(site.phone)}
            className="flex min-h-11 items-center self-start hover:text-copper"
          >
            {site.phone}
          </a>
        </address>
      </div>
    </footer>
  );
}
