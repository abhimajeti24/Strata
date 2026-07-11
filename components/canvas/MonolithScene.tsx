"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { onReveal } from "@/lib/reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const MonolithCanvas = dynamic(() => import("./MonolithCanvas"), { ssr: false });

export const MONOLITH_VISIBILITY_EVENT = "strata:monolith";

/**
 * Fixed WebGL layer behind the hero → manifesto range. The Manifesto's pin
 * dispatches a visibility event when scroll passes it, unmounting the canvas
 * so nothing renders behind opaque sections further down.
 *
 * The three.js chunk stays off the critical path: it only loads after the
 * preloader hands off, and in an idle slot. Low-power devices (≤4 cores)
 * get a pure-CSS monolith instead of WebGL.
 */
export function MonolithScene() {
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [mode, setMode] = useState<"pending" | "webgl" | "css">("pending");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const lowPower = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;

    // wait for the preloader reveal, then an idle slot, before paying for WebGL
    let idle = 0;
    const offReveal = onReveal(() => {
      const start = () => setMode(lowPower ? "css" : "webgl");
      // Safari has no requestIdleCallback
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(start, { timeout: 800 });
      } else {
        idle = window.setTimeout(start, 200);
      }
    });

    const mql = window.matchMedia("(max-width: 1023px)");
    const apply = () => setIsMobile(mql.matches);
    apply();
    mql.addEventListener("change", apply);

    const onVisibility = (e: Event) => setVisible((e as CustomEvent<boolean>).detail);
    window.addEventListener(MONOLITH_VISIBILITY_EVENT, onVisibility);

    return () => {
      offReveal();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      mql.removeEventListener("change", apply);
      window.removeEventListener(MONOLITH_VISIBILITY_EVENT, onVisibility);
    };
  }, []);

  if (mode === "pending") return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
      {mode === "webgl" && visible && <MonolithCanvas isMobile={isMobile} frozen={reduced} />}
      {mode === "css" && visible && <CssMonolith isMobile={isMobile} />}
    </div>
  );
}

/** Static stacked-strata mark - the fallback poster, drawn with divs. */
function CssMonolith({ isMobile }: { isMobile: boolean }) {
  const layers = [
    ["70%", 32, "#232320"],
    ["82%", 48, "#1c1c1a"],
    ["66%", 24, "#2a2a27"],
    ["88%", 60, "#1c1c1a"],
    ["75%", 30, "#232320"],
    ["84%", 52, "#1c1c1a"],
    ["88%", 38, "#232320"],
  ] as const;

  return (
    <div
      className={`absolute flex flex-col items-center ${
        isMobile ? "left-1/2 -translate-x-1/2 bottom-[16vh] w-40" : "right-[10vw] top-1/2 -translate-y-1/2 w-72"
      }`}
    >
      {layers.map(([w, h, bg], i) => (
        <div key={i} style={{ width: w, height: h, background: bg, marginTop: i ? 3 : 0 }} />
      ))}
    </div>
  );
}
