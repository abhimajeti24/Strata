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

// mini house mark, front elevation: [x, y, w, h] rects mirroring the 3D
// massing (plinth, slab, colonnade, living volume, roof, cantilever, core)
// plus the scattered offset each piece converges from
const MARK: Array<{ rect: [number, number, number, number]; from: [number, number] }> = [
  { rect: [44, 2, 10, 18], from: [3, -8] }, // service core
  { rect: [6, 6, 24, 10], from: [-5, -9] }, // cantilevered box
  { rect: [3, 16, 58, 3], from: [4, -6] }, // roof slab
  { rect: [30, 20, 26, 16], from: [4, -4] }, // living volume
  { rect: [8, 22, 2, 14], from: [-3, -3] }, // colonnade
  { rect: [16, 22, 2, 14], from: [2, -4] },
  { rect: [24, 22, 2, 14], from: [-2, -3] },
  { rect: [5, 36, 54, 3], from: [0, 4] }, // floor slab
  { rect: [2, 40, 60, 4], from: [0, 6] }, // plinth
];

/**
 * DWG 07 - the graphite panel slides up over Limewash; the tiny house
 * mark reassembles from scattered pieces, closing the narrative loop.
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

        const pieces = el.querySelectorAll("[data-mark] rect");
        pieces.forEach((piece, i) => {
          gsap.fromTo(
            piece,
            { x: MARK[i].from[0], y: MARK[i].from[1], opacity: 0.4 },
            {
              x: 0,
              y: 0,
              opacity: 1,
              ease: "none",
              scrollTrigger: { trigger: "[data-mark]", start: "top bottom", end: "top 94%", scrub: 0.5 },
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
        <AnnotationLabel className="mb-14 lg:mb-20">DWG 07 - Contact</AnnotationLabel>

        <MagneticButton
          href="mailto:hello@strata.studio"
          ariaLabel="Start a project - email the studio"
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
            © Strata 2026 - All drawings property of the studio
          </p>
          <svg data-mark viewBox="0 0 64 44" className="h-11 w-16" aria-hidden="true">
            {MARK.map(({ rect }, i) => (
              <rect key={i} x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} fill="#EAE9E4" />
            ))}
          </svg>
        </div>
      </div>
    </footer>
  );
}
