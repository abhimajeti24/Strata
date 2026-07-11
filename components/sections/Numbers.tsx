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

const INK = "#1C1C1A";
const REBAR = "#8A8781";
const BLUE = "#002FA7";

/**
 * DWG 05 - stats count up once on entry; the Cadence House plan draws
 * itself like a plotter as the section scrolls past: walls first, then
 * doors and glazing, then grid, dimensions and annotations fade in.
 */
export function Numbers() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // stats SSR with their real values (no-JS users see truth);
        // they only zero out here, when the count-up takes over
        gsap.utils.toArray<HTMLElement>("[data-stat]", el).forEach((stat) => {
          const target = Number(stat.dataset.stat);
          const counter = { value: 0 };
          stat.textContent = "0";
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

        // plotter draw: every stroke measured, dashed to its own length,
        // then un-dashed with the scrub in document order. All reads happen
        // before any style write to avoid layout thrash.
        const strokes = el.querySelectorAll<SVGGeometryElement>("[data-plan] [data-draw]");
        const lengths = Array.from(strokes, (path) => path.getTotalLength());
        strokes.forEach((path, i) => {
          path.style.strokeDasharray = `${lengths[i]}`;
          path.style.strokeDashoffset = `${lengths[i]}`;
        });
        gsap.to(strokes, {
          strokeDashoffset: 0,
          ease: "none",
          stagger: 0.04,
          scrollTrigger: { trigger: "[data-plan]", start: "top 92%", end: "bottom 45%", scrub: 0.5 },
        });

        // annotations arrive once the walls exist
        gsap.fromTo(
          "[data-plan] [data-fade]",
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.7,
            stagger: 0.06,
            scrollTrigger: { trigger: "[data-plan]", start: "top 55%", once: true },
          },
        );
      });

      // reduced motion: nothing to do, stats keep their server-rendered values
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Practice in numbers" className="relative z-10 bg-limewash px-5 py-24 lg:px-12 lg:py-32">
      <AnnotationLabel className="mb-10 lg:mb-16">DWG 05 - Practice in numbers</AnnotationLabel>

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
              {stat.value.toLocaleString("en-US")}
            </dd>
            <dt className="type-mono mt-3 text-rebar">{stat.label}</dt>
          </div>
        ))}
      </dl>

      <figure data-plan className="mt-16 lg:mt-24">
        <div className="overflow-x-auto">
          <svg
            viewBox="0 0 1344 470"
            fill="none"
            className="block h-auto w-full min-w-[760px]"
            role="img"
            aria-label="Floor plan of Cadence House at level +0.45m - entry, study, court, living, sleep"
          >
            {/* ── column grid (drafting layer) ── */}
            <g data-fade opacity="0">
              {[20, 380, 700, 1020, 1324].map((x, i) => (
                <g key={x}>
                  <line x1={x} y1="30" x2={x} y2="390" stroke={REBAR} strokeWidth="0.75" strokeDasharray="3 9" opacity="0.5" />
                  <circle cx={x} cy="13" r="10" stroke={BLUE} strokeWidth="1" />
                  <text x={x} y="17" fontSize="10" letterSpacing="1" fill={BLUE} textAnchor="middle" fontFamily="var(--font-plex), monospace">
                    {["A", "B", "C", "D", "E"][i]}
                  </text>
                </g>
              ))}
            </g>

            {/* ── outer walls, double line ── */}
            <rect data-draw x="20" y="30" width="1304" height="360" stroke={INK} strokeWidth="1.5" />
            <rect data-draw x="32" y="42" width="1280" height="336" stroke={INK} strokeWidth="1" />

            {/* ── partitions with door openings ── */}
            {/* grid B - entry / court */}
            <line data-draw x1="380" y1="42" x2="380" y2="168" stroke={INK} strokeWidth="1.2" />
            <line data-draw x1="380" y1="208" x2="380" y2="378" stroke={INK} strokeWidth="1.2" />
            {/* entry/study divider */}
            <line data-draw x1="32" y1="250" x2="250" y2="250" stroke={INK} strokeWidth="1.2" />
            <line data-draw x1="290" y1="250" x2="380" y2="250" stroke={INK} strokeWidth="1.2" />
            {/* grid C - court / living */}
            <line data-draw x1="700" y1="42" x2="700" y2="150" stroke={INK} strokeWidth="1.2" />
            <line data-draw x1="700" y1="190" x2="700" y2="378" stroke={INK} strokeWidth="1.2" />
            {/* grid D - living / sleep */}
            <line data-draw x1="1020" y1="42" x2="1020" y2="240" stroke={INK} strokeWidth="1.2" />
            <line data-draw x1="1020" y1="280" x2="1020" y2="378" stroke={INK} strokeWidth="1.2" />
            {/* bath partition in sleep block */}
            <line data-draw x1="1020" y1="130" x2="1160" y2="130" stroke={INK} strokeWidth="1.2" />
            <line data-draw x1="1200" y1="130" x2="1312" y2="130" stroke={INK} strokeWidth="1.2" />

            {/* ── door leaves + swings ── */}
            <line data-draw x1="380" y1="168" x2="340" y2="168" stroke={INK} strokeWidth="1" />
            <path data-draw d="M340,168 A40,40 0 0 1 380,208" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="250" y1="250" x2="250" y2="210" stroke={INK} strokeWidth="1" />
            <path data-draw d="M250,210 A40,40 0 0 1 290,250" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="700" y1="150" x2="740" y2="150" stroke={INK} strokeWidth="1" />
            <path data-draw d="M740,150 A40,40 0 0 1 700,190" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="1020" y1="240" x2="1060" y2="240" stroke={INK} strokeWidth="1" />
            <path data-draw d="M1060,240 A40,40 0 0 1 1020,280" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="1200" y1="130" x2="1200" y2="90" stroke={INK} strokeWidth="1" />
            <path data-draw d="M1200,90 A40,40 0 0 0 1160,130" stroke={INK} strokeWidth="0.75" />

            {/* ── glazing (windows in the wall cavity) ── */}
            <line data-draw x1="100" y1="384" x2="230" y2="384" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="760" y1="384" x2="950" y2="384" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="750" y1="36" x2="950" y2="36" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="1100" y1="36" x2="1270" y2="36" stroke={INK} strokeWidth="0.75" />
            <line data-draw x1="1318" y1="150" x2="1318" y2="280" stroke={INK} strokeWidth="0.75" />

            {/* ── court: open to sky - hatch + tree ── */}
            <g data-fade opacity="0">
              <line x1="410" y1="360" x2="560" y2="210" stroke={REBAR} strokeWidth="0.6" />
              <line x1="450" y1="360" x2="600" y2="210" stroke={REBAR} strokeWidth="0.6" />
              <line x1="490" y1="360" x2="640" y2="210" stroke={REBAR} strokeWidth="0.6" />
              <line x1="530" y1="360" x2="670" y2="220" stroke={REBAR} strokeWidth="0.6" />
              <circle cx="545" cy="130" r="28" stroke={REBAR} strokeWidth="0.75" />
              <circle cx="545" cy="130" r="3" fill={REBAR} />
            </g>

            {/* ── fixtures ── */}
            <g data-fade opacity="0">
              {/* kitchen counter */}
              <rect x="760" y="330" width="150" height="32" stroke={INK} strokeWidth="0.75" />
              <line x1="798" y1="330" x2="798" y2="362" stroke={INK} strokeWidth="0.5" />
              {/* bed */}
              <rect x="1120" y="286" width="130" height="76" stroke={INK} strokeWidth="0.75" />
              <line x1="1148" y1="286" x2="1148" y2="362" stroke={INK} strokeWidth="0.5" />
            </g>

            {/* ── room labels ── */}
            <g data-fade opacity="0" fontFamily="var(--font-plex), monospace">
              <text x="120" y="150" fontSize="11" letterSpacing="1.5" fill={REBAR}>ENTRY</text>
              <text x="120" y="322" fontSize="11" letterSpacing="1.5" fill={REBAR}>STUDY</text>
              <text x="480" y="90" fontSize="11" letterSpacing="1.5" fill={REBAR}>COURT</text>
              <text x="480" y="106" fontSize="8" letterSpacing="1.2" fill={REBAR}>OPEN TO SKY</text>
              <text x="810" y="120" fontSize="11" letterSpacing="1.5" fill={REBAR}>LIVING</text>
              <text x="1090" y="90" fontSize="11" letterSpacing="1.5" fill={REBAR}>BATH</text>
              <text x="1090" y="230" fontSize="11" letterSpacing="1.5" fill={REBAR}>SLEEP</text>
            </g>

            {/* ── north arrow ── */}
            <g data-fade opacity="0">
              <circle cx="978" cy="90" r="16" stroke={BLUE} strokeWidth="1" />
              <line x1="978" y1="102" x2="978" y2="80" stroke={BLUE} strokeWidth="1" />
              <path d="M973,86 L978,78 L983,86" stroke={BLUE} strokeWidth="1" fill="none" />
              <text x="978" y="66" fontSize="9" letterSpacing="1" fill={BLUE} textAnchor="middle" fontFamily="var(--font-plex), monospace">N</text>
            </g>

            {/* ── dimension chain ── */}
            <line data-draw x1="20" y1="432" x2="1324" y2="432" stroke={REBAR} strokeWidth="0.75" />
            {[20, 380, 700, 1020, 1324].map((x) => (
              <line key={x} data-draw x1={x} y1="426" x2={x} y2="438" stroke={REBAR} strokeWidth="0.75" />
            ))}
            <g data-fade opacity="0" fontFamily="var(--font-plex), monospace" fontSize="10" letterSpacing="1" fill={REBAR}>
              <text x="200" y="456" textAnchor="middle">9,000</text>
              <text x="540" y="456" textAnchor="middle">8,000</text>
              <text x="860" y="456" textAnchor="middle">8,000</text>
              <text x="1172" y="456" textAnchor="middle">7,600</text>
            </g>
          </svg>
        </div>
        <figcaption className="mt-4 flex flex-col gap-1 sm:flex-row sm:justify-between">
          <span className="type-mono text-[10px] text-rebar">Cadence House - plan at +0.45 m</span>
          <span className="type-mono text-[10px] text-rebar">Scale 1:200</span>
        </figcaption>
      </figure>
    </section>
  );
}
