"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { featured } from "@/lib/data/projects";

/**
 * DWG 04 - three scrubbed depth layers: image slowest, title mid,
 * specification card fastest. Title clip-reveals on entry, coordinates last.
 */
export function FeaturedProject() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        };

        gsap.fromTo("[data-layer-bg]", { yPercent: -12 }, { yPercent: 12, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-layer-title]", { yPercent: 20 }, { yPercent: -20, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-layer-card]", { yPercent: 35 }, { yPercent: -35, ease: "none", scrollTrigger: scrub });

        gsap.fromTo(
          "[data-title-line]",
          { yPercent: 110 },
          {
            yPercent: 0,
            duration: 1.1,
            stagger: 0.12,
            ease: strataEase,
            scrollTrigger: { trigger: el, start: "top 60%", once: true },
          },
        );

        gsap.fromTo(
          "[data-coord]",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            delay: 0.6,
            scrollTrigger: { trigger: el, start: "top 60%", once: true },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.fromTo(
          el.querySelectorAll("[data-title-line], [data-coord]"),
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            scrollTrigger: { trigger: el, start: "top 70%", once: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      aria-label="Featured project - Saltline Pavilion"
      className="hatch-dark relative z-10 min-h-svh overflow-hidden"
    >
      {/* layer 1 - image, slowest (oversized to cover parallax travel) */}
      <div data-layer-bg className="absolute -inset-y-[16%] inset-x-0" aria-hidden="true">
        <Image
          src={featured.image}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-45 grayscale"
        />
      </div>

      {/* corner coordinates */}
      <span data-coord className="type-mono absolute top-8 left-5 text-limewash/55 lg:top-10 lg:left-12">
        {featured.coordsN}
      </span>
      <span data-coord className="type-mono absolute top-8 right-5 text-limewash/55 lg:top-10 lg:right-12">
        DWG 04 - Featured
      </span>
      <span data-coord className="type-mono absolute bottom-8 left-5 text-limewash/55 lg:bottom-10 lg:left-12">
        {featured.coordsE}
      </span>

      {/* layer 2 - title */}
      <div data-layer-title className="absolute left-5 top-[24%] lg:left-12 lg:top-[36%]">
        <h2 className="type-display font-extrabold leading-[0.95] text-limewash text-[clamp(2.6rem,12vw,4rem)] lg:text-[86px]">
          {featured.title.map((line) => (
            <span key={line} className="clip">
              <span data-title-line className="block">
                {line}
              </span>
            </span>
          ))}
        </h2>
      </div>

      {/* layer 3 - specification card, fastest */}
      <div
        data-layer-card
        className="absolute inset-x-5 bottom-16 border border-rebar bg-limewash px-6 py-5 lg:inset-x-auto lg:right-24 lg:bottom-28 lg:w-[380px] lg:px-8 lg:py-7"
      >
        <p className="type-mono mb-4 border-b border-rebar pb-3 text-[10px] text-rebar">Specification</p>
        <dl className="grid grid-cols-[110px_1fr] gap-y-2.5">
          {featured.spec.map(([term, value]) => (
            <div key={term} className="contents">
              <dt className="type-mono text-rebar">{term}</dt>
              <dd className="type-mono text-graphite">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
