"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { signalReveal } from "@/lib/reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LETTERS = ["S", "T", "R", "A", "T", "A"];
const SESSION_KEY = "strata-loaded";

/**
 * DWG 00 — counter runs 0→100 while the wordmark clip-reveals; the overlay
 * exits upward and hands off to the hero 0.2s before it fully clears.
 * Skipped on revisit within the session; reduced-motion gets a 400ms card.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (sessionStorage.getItem(SESSION_KEY)) {
        setDone(true);
        signalReveal();
        return;
      }

      const finish = () => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setDone(true);
      };

      if (reduced) {
        gsap.timeline()
          .to(el, { autoAlpha: 0, duration: 0.2, delay: 0.4 })
          .call(signalReveal)
          .call(finish);
        return;
      }

      const counter = { value: 0 };
      const counterEl = el.querySelector<HTMLElement>("[data-counter]");

      gsap
        .timeline()
        .to(counter, {
          value: 100,
          duration: 1.6,
          ease: "power2.inOut",
          snap: { value: 1 },
          onUpdate: () => {
            if (counterEl) counterEl.textContent = String(counter.value).padStart(3, "0");
          },
        })
        .fromTo(
          "[data-letter]",
          { yPercent: 100 },
          { yPercent: 0, duration: 0.9, stagger: 0.05, ease: strataEase },
          0.15,
        )
        .call(signalReveal, [], "-=0.05")
        .to(el, { yPercent: -100, duration: 0.9, ease: strataEase }, "+=0.15")
        .call(finish);
    },
    { scope: ref, dependencies: [reduced] },
  );

  if (done) return null;

  return (
    <div ref={ref} className="fixed inset-0 z-50 bg-graphite" aria-hidden="true">
      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2">
        {LETTERS.map((letter, i) => (
          <span key={i} className="clip">
            <span
              data-letter
              className="type-display block text-[18vw] lg:text-[140px] font-extrabold leading-none text-limewash"
            >
              {letter}
            </span>
          </span>
        ))}
      </div>
      <p data-counter className="type-mono absolute bottom-10 left-5 lg:left-12 text-xs text-rebar">
        000
      </p>
      <p className="type-mono absolute bottom-10 right-5 lg:right-12 text-rebar hidden sm:block">
        DWG 00 — Loading Strata
      </p>
    </div>
  );
}
