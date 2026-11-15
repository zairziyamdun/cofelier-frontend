import { phoneHref, site } from "@/shared/config";

import { yandexMapLinkUrl, yandexMapWidgetUrl } from "../lib/map-urls";

const linkClass =
  "flex min-h-11 items-center self-start font-medium text-copper underline-offset-4 hover:underline";

export function ContactsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12 md:py-16">
      <h1 className="font-heading text-4xl md:text-5xl">Контакты</h1>
      <p className="mt-2 text-muted-foreground">
        Заходите в мастерскую или закажите заранее — оплата при получении.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-8">
          <section aria-labelledby="address-title">
            <h2 id="address-title" className="font-heading text-2xl">
              Адрес
            </h2>
            <address className="mt-2 flex flex-col not-italic">
              <span className="text-lg">
                {site.city}, {site.address}
              </span>
              <span className="text-muted-foreground">{site.addressNote}</span>
              <a
                href={yandexMapLinkUrl(site.map)}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                Открыть в Яндекс Картах
              </a>
            </address>
          </section>

          <section aria-labelledby="hours-title">
            <h2 id="hours-title" className="font-heading text-2xl">
              Часы работы
            </h2>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-lg">
              {site.hours.map((row) => (
                <div key={row.days} className="contents">
                  <dt className="text-muted-foreground">{row.days}</dt>
                  <dd>{row.time}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="reach-title">
            <h2 id="reach-title" className="font-heading text-2xl">
              Связаться
            </h2>
            <div className="mt-2 flex flex-col">
              <a href={phoneHref(site.phone)} className={linkClass}>
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className={linkClass}>
                {site.email}
              </a>
              <a
                href={`https://instagram.com/${site.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                @{site.instagram}
              </a>
            </div>
          </section>
        </div>

        <iframe
          title={`Cofelier на карте: ${site.city}, ${site.address}`}
          src={yandexMapWidgetUrl(site.map)}
          loading="lazy"
          className="aspect-square w-full rounded-xl border border-border md:aspect-auto md:min-h-112"
        />
      </div>
    </main>
  );
}
