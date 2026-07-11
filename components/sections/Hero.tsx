"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { onReveal } from "@/lib/reveal";
import { monolithState } from "@/lib/monolithStore";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";
import { DimensionLine } from "@/components/ui/DimensionLine";

const HEADLINE: Array<{ text: string; stroke: boolean }> = [
  { text: "We build", stroke: false },
  { text: "Silence", stroke: true },
  { text: "into cities", stroke: false },
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current!;

      if (reduced) {
        monolithState.intro = 1;
        return;
      }

      // element targets, not selector strings: the reveal callback fires from
      // inside the preloader's gsap context, where selectors would be
      // re-scoped to the preloader and match nothing
      const lines = gsap.utils.toArray<HTMLElement>("[data-hero-line]", el);
      const sub = gsap.utils.toArray<HTMLElement>("[data-hero-sub]", el);
      const cue = el.querySelector("[data-hero-cue]");

      gsap.set(lines, { yPercent: 110 });
      gsap.set(sub, { opacity: 0, y: 12 });
      gsap.set(cue, { opacity: 0 });

      const offReveal = onReveal(() => {
        gsap
          .timeline()
          .to(lines, { yPercent: 0, duration: 1.1, stagger: 0.12, ease: strataEase })
          .to(sub, { opacity: 1, y: 0, duration: 0.8, ease: strataEase }, "-=0.55")
          .to(monolithState, { intro: 1, duration: 1.4, ease: "power2.out" }, 0.2)
          .to(cue, { opacity: 1, duration: 0.6 }, "-=0.6");
      });

      // scroll cue oscillates until the first scroll
      const cueTween = gsap.to("[data-hero-cue] span:last-child", {
        y: 5,
        duration: 0.9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      const killCue = () => {
        cueTween.kill();
        gsap.to(cue, { opacity: 0, duration: 0.4 });
      };
      window.addEventListener("scroll", killCue, { once: true, passive: true });

      // pointer parallax feeds the monolith camera rig (desktop only)
      const onMove = (e: PointerEvent) => {
        monolithState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
        monolithState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      };
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        el.addEventListener("pointermove", onMove);
      }

      return () => {
        offReveal();
        window.removeEventListener("scroll", killCue);
        el.removeEventListener("pointermove", onMove);
      };
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <section
      ref={ref}
      id="top"
      aria-label="Introduction"
      className="relative z-10 flex min-h-svh flex-col justify-between px-5 pt-28 pb-8 lg:px-12 lg:pt-40 lg:pb-10"
    >
      <div>
        <AnnotationLabel className="mb-8 lg:mb-12">DWG 01 - Foundation</AnnotationLabel>
        <h1 className="type-display font-extrabold leading-[0.9] text-graphite text-[clamp(2.5rem,11.4vw,5rem)] lg:text-[min(8.3vw,120px)]">
          {HEADLINE.map((line) => (
            <span key={line.text} className="clip">
              <span data-hero-line className={`block ${line.stroke ? "type-stroke" : ""}`}>
                {line.text}
              </span>
            </span>
          ))}
        </h1>
        <p data-hero-sub className="type-mono mt-6 max-w-xs leading-[1.8] text-rebar lg:mt-9 lg:max-w-none lg:text-xs">
          Architecture &amp; spatial practice - est. 2019 - BLR / SGP
        </p>
      </div>

      {/* dimension annotation under the house */}
      <div data-hero-sub className="absolute bottom-[9vh] right-[4.5vw] hidden w-[440px] lg:block">
        <DimensionLine label="12,400 MM" />
      </div>

      <p data-hero-cue className="type-mono flex items-center gap-2 text-graphite">
        Scroll to excavate <span aria-hidden="true">↓</span>
      </p>
    </section>
  );
}
