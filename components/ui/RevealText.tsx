"use client";

import { useRef, type ReactNode, type ElementType } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** seconds, added to the scroll-triggered start */
  delay?: number;
};

/**
 * Clip-reveal on scroll entry: content rises out of an overflow-hidden
 * wrapper. Falls back to a plain opacity fade under reduced motion.
 */
export function RevealText({ children, as = "div", className = "", delay = 0 }: Props) {
  const Tag = as as "div";
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const inner = wrap.current?.firstElementChild;
      if (!inner) return;

      if (reduced) {
        gsap.fromTo(
          inner,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 0.4,
            scrollTrigger: { trigger: wrap.current, start: "top 88%", once: true },
          },
        );
        return;
      }

      gsap.fromTo(
        inner,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          delay,
          ease: strataEase,
          scrollTrigger: { trigger: wrap.current, start: "top 88%", once: true },
        },
      );
    },
    { scope: wrap, dependencies: [reduced] },
  );

  return (
    <span ref={wrap} className="clip">
      <Tag className={`block ${className}`}>{children}</Tag>
    </span>
  );
}
