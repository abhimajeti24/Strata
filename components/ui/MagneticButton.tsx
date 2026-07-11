"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

type Props = {
  children: ReactNode;
  href: string;
  className?: string;
  /** element that translates toward the cursor (defaults to whole link) */
  magnetSelector?: string;
  ariaLabel?: string;
};

const RADIUS = 24;

/**
 * Magnetic link - on pointer-fine devices the target drifts toward the
 * cursor within a 24px radius and springs back on leave (gsap.quickTo).
 */
export function MagneticButton({ children, href, className = "", magnetSelector, ariaLabel }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const target = magnetSelector ? el.querySelector<HTMLElement>(magnetSelector) ?? el : el;
      const toX = gsap.quickTo(target, "x", { duration: 0.5, ease: "power3.out" });
      const toY = gsap.quickTo(target, "y", { duration: 0.5, ease: "power3.out" });

      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(dist, RADIUS);
        toX((dx / dist) * pull);
        toY((dy / dist) * pull);
      };
      const leave = () => {
        toX(0);
        toY(0);
      };

      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
      return () => {
        el.removeEventListener("pointermove", move);
        el.removeEventListener("pointerleave", leave);
      };
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <a ref={ref} href={href} className={className} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
