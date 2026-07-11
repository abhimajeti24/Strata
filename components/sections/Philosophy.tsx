"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";

const PRINCIPLES = [
  {
    n: "01",
    word: "Mass",
    body: "Weight is honesty. We build heavy - walls that hold their temperature, their sound, and their nerve - so buildings age instead of expiring.",
  },
  {
    n: "02",
    word: "Light",
    body: "Daylight is the only ornament we trust. Walls exist to shape it; every window is placed like an instrument, not punched like a hole.",
  },
  {
    n: "03",
    word: "Void",
    body: "Every plan keeps one room with no program - a court, a shaft, a pause. The empty room is the one that does the listening.",
  },
  {
    n: "04",
    word: "Time",
    body: "Board-formed concrete keeps a diary of weather. We design for the building at year forty, not for the photograph at day one.",
  },
];

/**
 * DWG 06 - the four words the studio designs by, each stated and then
 * argued in one sentence. Rows rise on entry; the word fills from stroke
 * to solid on hover.
 */
export function Philosophy() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", el);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        rows.forEach((row) => {
          gsap
            .timeline({
              scrollTrigger: { trigger: row, start: "top 85%", once: true },
            })
            .fromTo(
              row.querySelector("[data-rule]"),
              { scaleX: 0 },
              { scaleX: 1, duration: 1.1, ease: strataEase },
              0,
            )
            .fromTo(
              row.querySelectorAll("[data-cell]"),
              { y: 36, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.9, stagger: 0.08, ease: strataEase },
              0.1,
            );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        rows.forEach((row) => {
          gsap.fromTo(
            row,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              scrollTrigger: { trigger: row, start: "top 88%", once: true },
            },
          );
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="philosophy" aria-label="Philosophy" className="relative z-10 bg-limewash px-5 py-24 lg:px-12 lg:py-32">
      <AnnotationLabel className="mb-12 lg:mb-16">DWG 06 - Philosophy / What we design by</AnnotationLabel>

      <ol className="list-none">
        {PRINCIPLES.map((principle) => (
          <li key={principle.n} data-row className="philo-row group relative">
            <span data-rule className="block h-px origin-left bg-rebar/60" aria-hidden="true" />
            <div className="grid items-center gap-x-8 gap-y-3 py-8 lg:grid-cols-[72px_1fr_minmax(0,44ch)] lg:py-12">
              <span data-cell className="type-mono self-start pt-2 text-rebar lg:pt-4">
                {principle.n}
              </span>
              <h3
                data-cell
                className="philo-word type-display text-[17vw] font-extrabold leading-[0.9] lg:text-[7.5vw]"
              >
                {principle.word}
              </h3>
              <p data-cell className="max-w-[44ch] text-base leading-[1.6] text-graphite lg:text-lg">
                {principle.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
