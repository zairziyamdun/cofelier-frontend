import { advantages, advantagesTitle } from "../config/content";

export function AdvantagesSection() {
  return (
    <section
      aria-labelledby="advantages-title"
      className="mx-auto max-w-6xl px-4 py-24 md:py-32"
    >
      <h2
        id="advantages-title"
        data-split
        className="mb-12 font-heading text-[clamp(2.5rem,6vw,4.5rem)] leading-none md:mb-16"
      >
        {advantagesTitle}
      </h2>
      <ul className="grid gap-4 md:grid-cols-3 md:gap-6">
        {advantages.map((item, index) => (
          <li
            key={item.title}
            data-reveal
            className="group relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-cream/10 bg-cream/[0.03] p-8 transition-[border-color,translate,box-shadow] duration-500 hover:-translate-y-2 hover:border-copper/60 hover:shadow-[0_24px_48px_-24px] hover:shadow-copper/40"
          >
            <span className="font-heading text-sm text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-heading text-2xl text-copper md:text-3xl">
              {item.title}
            </h3>
            <p className="text-muted-foreground">{item.text}</p>
            {/* Медная полоса выезжает снизу при наведении. */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-copper transition-transform duration-500 group-hover:scale-x-100"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
