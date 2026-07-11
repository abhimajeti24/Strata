"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Lenis smooth scroll synced to ScrollTrigger. Smoothing is wheel-only -
 * touch devices keep native momentum. Skipped entirely under
 * prefers-reduced-motion.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });
    window.__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [reduced]);

  return <>{children}</>;
}
