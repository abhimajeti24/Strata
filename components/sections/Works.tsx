"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { projects, type Project } from "@/lib/data/projects";
import { AnnotationLabel } from "@/components/ui/AnnotationLabel";

/**
 * Selected works. Desktop: pinned section, cards travel horizontally with a
 * scrubbed translate; each card clip-reveals as it enters and its image
 * counter-parallaxes for depth. Mobile: vertical stack, native swipe
 * untouched, clip + rise entrances.
 */
export function Works() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      const track = el.querySelector<HTMLElement>("[data-track]")!;
      const progressBar = el.querySelector<HTMLElement>("[data-progress]");
      const verticalTitle = el.querySelector<HTMLElement>("[data-vertical-title]");
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", el);

      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const distance = () => track.scrollWidth - window.innerWidth;

        const scrollTween = gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (progressBar) progressBar.style.transform = `scaleX(${self.progress})`;
              // vertical title bows out before the cards travel over it
              if (verticalTitle) verticalTitle.style.opacity = String(Math.max(0, 1 - self.progress / 0.1));
            },
          },
        });

        cards.forEach((card) => {
          gsap.fromTo(
            card.querySelector("[data-media]"),
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              duration: 1,
              ease: strataEase,
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left 92%",
                once: true,
              },
            },
          );

          gsap.fromTo(
            card.querySelector("[data-parallax]"),
            { xPercent: -8 },
            {
              xPercent: 8,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: scrollTween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });
      });

      mm.add("(max-width: 1023px) and (prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 48, clipPath: "inset(0 0 18% 0)", opacity: 0 },
            {
              y: 0,
              clipPath: "inset(0 0 0% 0)",
              opacity: 1,
              duration: 1,
              ease: strataEase,
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
            },
          );
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.4,
              scrollTrigger: { trigger: card, start: "top 88%", once: true },
            },
          );
        });
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="works" aria-label="Selected works" className="relative z-10 bg-limewash lg:h-svh lg:overflow-hidden">
      <div className="absolute top-8 left-5 z-10 lg:top-10 lg:left-12">
        <AnnotationLabel>DWG 03 — Selected works</AnnotationLabel>
      </div>

      {/* vertical pinned title, desktop — fades as the cards travel over it */}
      <h2
        data-vertical-title
        className="type-display absolute bottom-12 left-12 z-0 hidden rotate-180 text-[22px] font-bold tracking-[0.02em] text-graphite lg:block"
        style={{ writingMode: "vertical-rl" }}
      >
        Selected works 2019–2026
      </h2>

      {/* mobile title */}
      <div className="px-5 pt-20 lg:hidden">
        <h2 className="type-display hairline-b border-rebar pb-5 text-[26px] font-bold text-graphite">
          Selected works 2019–2026
        </h2>
      </div>

      <div
        data-track
        className="flex flex-col gap-12 px-5 py-10 lg:h-full lg:flex-row lg:items-center lg:gap-14 lg:py-0 lg:pl-40 lg:pr-[12vw]"
      >
        {projects.map((project) => (
          <WorkCard key={project.index} project={project} />
        ))}
      </div>

      {/* progress rule, desktop */}
      <div className="absolute bottom-12 left-40 right-12 hidden h-px bg-rebar/40 lg:block" aria-hidden="true">
        <div data-progress className="h-px origin-left scale-x-0 bg-graphite" />
      </div>
    </section>
  );
}

function WorkCard({ project }: { project: Project }) {
  return (
    <article data-card className="work-card group relative w-full flex-none lg:w-[340px]">
      {/* blue dimension frame — draws on hover */}
      <svg
        className="work-frame pointer-events-none absolute -inset-3 z-10 hidden h-[calc(100%+24px)] w-[calc(100%+24px)] lg:block"
        aria-hidden="true"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <rect
          x="0.5"
          y="0.5"
          width="99"
          height="99"
          fill="none"
          stroke="#002FA7"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          pathLength={2}
        />
      </svg>
      <span className="work-dim type-mono absolute -top-8 right-0 z-10 hidden text-[9px] text-blueprint lg:block" aria-hidden="true">
        425 × 340
      </span>

      <div className="type-mono mb-2.5 flex justify-between text-[10px] text-rebar">
        <span>{project.index}</span>
        <span>{project.coords}</span>
      </div>

      <div data-media className="relative aspect-[4/5] overflow-hidden">
        <div data-parallax className="absolute inset-y-0 -left-[8%] w-[116%]">
          <Image
            src={project.image}
            alt={project.alt}
            fill
            sizes="(min-width: 1024px) 394px, 100vw"
            className="work-img object-cover"
          />
        </div>
      </div>

      <h3 className="type-display mt-3.5 text-[22px] font-bold tracking-[-0.01em] text-graphite lg:text-2xl">
        {project.title}
      </h3>
      <p className="type-mono mt-1.5 text-rebar">
        {project.year} — {project.location} · {project.category}
      </p>
    </article>
  );
}
