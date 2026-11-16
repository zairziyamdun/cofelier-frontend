import { manifesto } from "../config/content";

export function ManifestoSection() {
  return (
    <section
      aria-labelledby="manifesto-title"
      className="relative bg-charcoal py-24 text-cream md:py-40"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 md:gap-24">
        <div className="flex flex-col gap-6">
          <h2
            id="manifesto-title"
            className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm"
          >
            {manifesto.eyebrow}
          </h2>
          <p
            data-manifesto
            className="max-w-5xl font-heading text-[clamp(1.75rem,5vw,3.75rem)] leading-[1.15]"
          >
            {manifesto.text}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 border-t border-cream/10 pt-10 md:grid-cols-4">
          {manifesto.stats.map((stat) => (
            <div key={stat.label} data-reveal className="flex flex-col gap-2">
              <dt className="order-last text-sm text-cream/60">{stat.label}</dt>
              <dd className="font-heading text-5xl text-copper md:text-6xl">
                <span data-count>{stat.value}</span>
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
