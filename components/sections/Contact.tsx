"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";
import { MagneticButton } from "@/components/ui/MagneticButton";

const COLUMNS = [
  { label: "New business", value: "hello@strata.studio", href: "mailto:hello@strata.studio" },
  { label: "Studio", value: "44 Residency Rd, Bengaluru", href: null },
  { label: "Elsewhere", value: "Instagram / LinkedIn / Are.na", href: null },
];

// mini monolith mark: [width, height] pairs, converging strata
const MARK = [
  [28, 8],
  [24, 5],
  [28, 10],
  [22, 5],
  [26, 8],
  [20, 4],
  [28, 9],
] as const;

/**
 * DWG 07 — the graphite panel slides up over Limewash; the tiny monolith
 * mark reassembles from scattered offsets, closing the narrative loop.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          el.querySelector("[data-panel]"),
          { yPercent: 8, opacity: 0.4 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.2,
            ease: strataEase,
            scrollTrigger: { trigger: el, start: "top 80%", once: true },
          },
        );

        const bars = el.querySelectorAll("[data-mark] div");
        bars.forEach((bar, i) => {
          gsap.fromTo(
            bar,
            { y: (i - 3) * 6, x: i % 2 ? 5 : -5, opacity: 0.4 },
            {
              y: 0,
              x: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: "[data-mark]", start: "top bottom", end: "top 88%", scrub: 0.5 },
            },
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          el.querySelector("[data-panel]"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <footer ref={ref} id="contact" aria-label="Contact" className="relative z-10 bg-limewash">
      <div data-panel className="bg-graphite px-5 pt-20 pb-10 lg:px-12 lg:pt-28 lg:pb-12">
        <AnnotationLabel className="mb-14 lg:mb-20">DWG 07 — Contact</AnnotationLabel>

        <MagneticButton
          href="mailto:hello@strata.studio"
          ariaLabel="Start a project — email the studio"
          magnetSelector="[data-arrow]"
          className="group inline-block"
        >
          <span className="type-display block font-extrabold leading-[0.95] text-limewash text-[clamp(2.6rem,11vw,4rem)] lg:text-[min(8vw,115px)]">
            Start a project{" "}
            <span
              data-arrow
              className="inline-block transition-colors duration-300 group-hover:text-blueprint"
              aria-hidden="true"
            >
              →
            </span>
          </span>
        </MagneticButton>

        <div className="mt-16 grid gap-8 border-t border-rebar/50 pt-8 sm:grid-cols-3 sm:gap-12 lg:mt-24">
          {COLUMNS.map((col) => (
            <div key={col.label} className="flex flex-col gap-3">
              <span className="type-mono text-rebar">{col.label}</span>
              {col.href ? (
                <a href={col.href} className="type-mono text-xs text-limewash hover:text-blueprint">
                  {col.value}
                </a>
              ) : (
                <span className="type-mono text-xs text-limewash">{col.value}</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-20 flex items-end justify-between lg:mt-28">
          <p className="type-mono max-w-[240px] text-[9px] text-rebar sm:max-w-none sm:text-[10px]">
            © Strata 2026 — All drawings property of the studio
          </p>
          <div data-mark className="flex flex-col items-center" aria-hidden="true">
            {MARK.map(([w, h], i) => (
              <div key={i} style={{ width: w, height: h, marginTop: i ? 1 : 0 }} className="bg-limewash" />
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
