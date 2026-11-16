import { journey } from "../config/content";

import { ModelSlot } from "./ModelSlot";

// На телефоне — вертикальная лента; с md секция закрепляется
// и шаги прокручиваются горизонтально (см. lib/home-motion).
export function JourneySection() {
  return (
    <section
      data-journey
      aria-labelledby="journey-title"
      className="relative overflow-hidden md:h-svh"
    >
      <div
        data-journey-track
        className="flex flex-col gap-6 px-4 py-24 md:h-full md:w-max md:flex-row md:items-stretch md:gap-8 md:px-[8vw] md:py-[14vh]"
      >
        <div
          data-journey-panel
          className="flex flex-col justify-center gap-6 pb-8 md:w-[38vw] md:pr-[6vw] md:pb-0"
        >
          <p className="text-xs tracking-[0.3em] text-copper uppercase sm:text-sm">
            {journey.eyebrow}
          </p>
          <h2
            id="journey-title"
            data-split
            className="font-heading text-[clamp(2.5rem,6vw,5.5rem)] leading-none"
          >
            {journey.title}
          </h2>
          <p className="max-w-sm text-lg text-cream/70">{journey.text}</p>
          <p
            aria-hidden="true"
            className="hidden items-center gap-4 text-xs tracking-[0.3em] text-cream/50 uppercase md:flex"
          >
            {journey.hint}
            <span className="h-px w-16 bg-copper" />
          </p>
        </div>

        {journey.steps.map((step, index) => (
          <article
            key={step.title}
            data-journey-panel
            className="relative flex min-h-[30rem] flex-col justify-end overflow-hidden rounded-3xl border border-cream/10 bg-cream/[0.03] p-6 md:min-h-0 md:w-[min(34rem,40vw)] md:p-10"
          >
            <span
              aria-hidden="true"
              data-journey-num
              // Свой слой: параллакс цифры не перерисовывает всю ленту.
              className="pointer-events-none absolute -top-6 right-0 font-heading text-[clamp(9rem,22vw,18rem)] leading-none text-outline md:will-change-transform"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            {/* Предмет шага занимает всё место карточки над текстом. */}
            <ModelSlot model={step.model} className="min-h-40 flex-1" />
            <div
              data-journey-body
              className="relative flex shrink-0 flex-col gap-4 md:*:will-change-[transform,opacity]"
            >
              <p className="text-xs tracking-[0.25em] text-cream/50 uppercase">
                {step.kicker}
              </p>
              <h3 className="font-heading text-4xl md:text-5xl">
                {step.title}
              </h3>
              <p className="max-w-sm text-cream/70 md:text-lg">{step.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-[8vw] bottom-[6vh] hidden h-px bg-cream/10 md:block"
      >
        <div data-journey-progress className="h-full origin-left bg-copper" />
      </div>
    </section>
  );
}
