"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";

const STATS = [
  { value: 27, label: "Built works" },
  { value: 14, label: "Design awards" },
  { value: 96000, label: "sqm delivered" },
];

/**
 * DWG 05 — stats count up once on entry; the Cadence House plan literally
 * draws itself (stroke-dashoffset) as the section scrolls past.
 */
export function Numbers() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-stat]", el).forEach((stat) => {
          const target = Number(stat.dataset.stat);
          const counter = { value: 0 };
          gsap.to(counter, {
            value: target,
            duration: 1.4,
            ease: "power2.out",
            snap: { value: 1 },
            scrollTrigger: { trigger: stat, start: "top 85%", once: true },
            onUpdate: () => {
              stat.textContent = counter.value.toLocaleString("en-US");
            },
          });
        });

        const strokes = el.querySelectorAll<SVGGeometryElement>("[data-plan] [data-draw]");
        strokes.forEach((path) => {
          const length = path.getTotalLength();
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
        });
        gsap.to(strokes, {
          strokeDashoffset: 0,
          ease: "none",
          stagger: 0.08,
          scrollTrigger: { trigger: "[data-plan]", start: "top 95%", end: "bottom 40%", scrub: 0.5 },
        });
        gsap.fromTo(
          "[data-plan] text",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: { trigger: "[data-plan]", start: "top 55%", once: true },
          },
        );
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.utils.toArray<HTMLElement>("[data-stat]", el).forEach((stat) => {
          stat.textContent = Number(stat.dataset.stat).toLocaleString("en-US");
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Practice in numbers" className="relative z-10 bg-limewash px-5 py-24 lg:px-12 lg:py-32">
      <AnnotationLabel className="mb-10 lg:mb-16">DWG 05 — Practice in numbers</AnnotationLabel>

      <dl className="grid border-t border-rebar sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`py-8 lg:py-10 ${i > 0 ? "sm:pl-12 sm:border-l sm:border-rebar/40 border-t border-rebar/40 sm:border-t-0" : ""}`}
          >
            <dd
              data-stat={stat.value}
              className="type-display text-6xl font-bold tracking-[-0.02em] text-graphite lg:text-[86px] lg:leading-none"
            >
              0
            </dd>
            <dt className="type-mono mt-3 text-rebar">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <figure data-plan className="mt-16 lg:mt-24">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 1344 300"
            fill="none"
            className="block h-auto w-full min-w-[640px]"
            role="img"
            aria-label="Floor plan of Cadence House at level +0.45m"
          >
            <rect data-draw x="1" y="20" width="1342" height="260" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="360" y1="20" x2="360" y2="150" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="360" y1="210" x2="360" y2="280" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="1" y1="150" x2="220" y2="150" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="290" y1="150" x2="360" y2="150" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="700" y1="20" x2="700" y2="110" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="700" y1="180" x2="700" y2="280" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="360" y1="200" x2="560" y2="200" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="620" y1="200" x2="700" y2="200" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="1020" y1="20" x2="1020" y2="280" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="1020" y1="130" x2="1180" y2="130" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="1250" y1="130" x2="1343" y2="130" stroke="#1C1C1A" strokeWidth="1" />
            <rect data-draw x="430" y="60" width="180" height="90" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="760" y1="240" x2="960" y2="240" stroke="#1C1C1A" strokeWidth="1" />
            <line data-draw x1="760" y1="240" x2="760" y2="280" stroke="#1C1C1A" strokeWidth="1" />
            <text x="60" y="90" fontSize="10" letterSpacing="1" fill="#8A8781" className="font-mono">ENTRY</text>
            <text x="430" y="45" fontSize="10" letterSpacing="1" fill="#8A8781" className="font-mono">COURT</text>
            <text x="760" y="60" fontSize="10" letterSpacing="1" fill="#8A8781" className="font-mono">LIVING</text>
            <text x="1060" y="60" fontSize="10" letterSpacing="1" fill="#8A8781" className="font-mono">SLEEP</text>
            <text x="60" y="240" fontSize="10" letterSpacing="1" fill="#8A8781" className="font-mono">STUDY</text>
          </svg>
        </div>
        <figcaption className="mt-4 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span className="type-mono text-[10px] text-rebar">Cadence House — plan at +0.45 m</span>
          <span className="type-mono text-[10px] text-rebar">Scale 1:200</span>
        </figcaption>
      </figure>
    </section>
  );
}
