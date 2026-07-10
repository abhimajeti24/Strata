"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";

const PHRASE = "Mass · Light · Void · Time · ";

/**
 * DWG 06 — counter-scrolling philosophy rows. Loop speed multiplies with
 * scroll velocity (clamped 1–3×); both tweens pause when off-screen.
 */
export function Marquee() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const left = gsap.to("[data-row-left]", { xPercent: -50, duration: 26, repeat: -1, ease: "none" });
        const right = gsap.fromTo(
          "[data-row-right]",
          { xPercent: -50 },
          { xPercent: 0, duration: 26, repeat: -1, ease: "none" },
        );

        const speed = gsap.quickTo(left, "timeScale", { duration: 0.4 });
        const speedR = gsap.quickTo(right, "timeScale", { duration: 0.4 });
        const onTick = () => {
          const velocity = Math.abs(window.__lenis?.velocity ?? 0);
          const scale = gsap.utils.clamp(1, 3, 1 + velocity / 40);
          speed(scale);
          speedR(scale);
        };
        gsap.ticker.add(onTick);

        gsap.timeline({
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => {
              left.paused(!self.isActive);
              right.paused(!self.isActive);
            },
          },
        });

        return () => {
          gsap.ticker.remove(onTick);
        };
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        // rows stay static; nothing animates
      });
    },
    { scope: ref },
  );

  const row = (
    <>
      {PHRASE.repeat(4)}
      {PHRASE.repeat(4)}
    </>
  );

  return (
    <section ref={ref} aria-label="Philosophy" className="relative z-10 overflow-hidden bg-limewash py-20 lg:py-28">
      <div className="px-5 lg:px-12">
        <AnnotationLabel className="mb-12 lg:mb-16">DWG 06 — Philosophy</AnnotationLabel>
      </div>

      <p className="sr-only">Mass, light, void, time.</p>

      <div aria-hidden="true">
        <div
          data-row-left
          className="type-display type-stroke-thin whitespace-nowrap text-[18vw] font-extrabold leading-none will-change-transform lg:text-[115px]"
        >
          {row}
        </div>
        <div
          data-row-right
          className="type-display mt-4 whitespace-nowrap text-[18vw] font-extrabold leading-none text-graphite will-change-transform lg:mt-6 lg:text-[115px]"
        >
          {row}
        </div>
      </div>
    </section>
  );
}
