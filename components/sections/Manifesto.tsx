"use client";

import { useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { monolithState } from "@/lib/monolithStore";
import { MONOLITH_VISIBILITY_EVENT } from "@/components/canvas/MonolithScene";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";

const QUOTE =
  "“Every building is a section cut through time. We design in layers - ground, structure, light, air - and we leave the seams visible. What a city needs is not more noise. It is rooms that hold their silence.”";

/**
 * The signature moment. Pinned for 250% of viewport height; one scrubbed
 * timeline reveals the manifesto word by word while the same progress value
 * drives the monolith apart behind the text.
 */
export function Manifesto() {
  const ref = useRef<HTMLElement>(null);
  const words = useMemo(() => QUOTE.split(" "), []);

  useGSAP(
    () => {
      const el = ref.current!;
      const wordEls = gsap.utils.toArray<HTMLElement>("[data-word]", el);

      const setVisible = (visible: boolean) =>
        window.dispatchEvent(new CustomEvent(MONOLITH_VISIBILITY_EVENT, { detail: visible }));

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const progress = { value: 0 };

        gsap
          .timeline({
            scrollTrigger: {
              trigger: el,
              start: "top top",
              end: "+=250%",
              pin: true,
              scrub: 1,
              onLeave: () => setVisible(false),
              onEnterBack: () => setVisible(true),
            },
          })
          .to(wordEls, { opacity: 1, stagger: 0.6, duration: 0.8, ease: "none" }, 0)
          .to(
            progress,
            {
              value: 1,
              duration: wordEls.length * 0.6,
              ease: "none",
              onUpdate: () => {
                monolithState.deconstruct = progress.value;
              },
            },
            0,
          );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(wordEls, { opacity: 1 });
        gsap.fromTo(
          el.querySelector("[data-quote]"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.5,
            scrollTrigger: { trigger: el, start: "top 70%", once: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="studio" aria-label="Manifesto" className="relative z-10 flex min-h-svh items-center">
      <div className="absolute top-8 left-5 lg:top-10 lg:left-12">
        <AnnotationLabel>DWG 02 - Manifesto / Section cut A–A</AnnotationLabel>
      </div>
      <p className="type-mono absolute top-8 right-5 lg:top-10 lg:right-12 text-rebar">02 / 07</p>

      <blockquote
        data-quote
        className="type-display mx-auto max-w-[1100px] px-5 text-center font-semibold leading-[1.25] tracking-[-0.01em] text-graphite text-[clamp(1.55rem,5.4vw,2.1rem)] lg:px-0 lg:text-[3.5vw]"
      >
        {words.map((word, i) => (
          <span key={i} data-word className="opacity-15">
            {word}{" "}
          </span>
        ))}
      </blockquote>

      <p className="type-mono absolute bottom-8 left-5 lg:bottom-10 lg:left-12 hidden text-[10px] text-rebar sm:block">
        Pinned - text advances with scroll / monolith separates behind
      </p>
    </section>
  );
}
