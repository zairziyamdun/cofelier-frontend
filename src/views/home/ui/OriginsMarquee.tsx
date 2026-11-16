import { origins } from "../config/content";

// Строка повторена дважды: цикл сдвигает ряд ровно на одну копию — шов не виден.
export function OriginsMarquee() {
  return (
    <div className="overflow-x-clip py-10 md:py-16">
      <section
        data-marquee
        aria-label="Страны, откуда наше зерно"
        className="-mx-4 -rotate-2 bg-copper py-4 text-charcoal md:py-6"
      >
        <div data-marquee-row className="flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
              className="flex shrink-0 items-center"
            >
              {[...origins, ...origins].map((origin, index) => (
                <li
                  key={`${origin}-${index}`}
                  className="flex items-center gap-8 pr-8 font-heading text-4xl whitespace-nowrap italic md:gap-12 md:pr-12 md:text-6xl"
                >
                  {origin}
                  <span
                    aria-hidden="true"
                    className="text-2xl not-italic md:text-3xl"
                  >
                    ✦
                  </span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </section>
    </div>
  );
}
