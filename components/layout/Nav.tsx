"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, strataEase } from "@/lib/gsap";
import { onReveal } from "@/lib/reveal";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const LINKS = [
  { label: "Works", href: "#works" },
  { label: "Studio", href: "#studio" },
  { label: "Contact", href: "#contact" },
];

export function Nav() {
  const ref = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>("[data-nav-item]", ref.current!);
      if (reduced) return;
      gsap.set(items, { opacity: 0, y: -8 });
      const off = onReveal(() => {
        gsap.to(items, { opacity: 1, y: 0, duration: 0.8, stagger: 0.04, ease: strataEase, delay: 0.3 });
      });
      return off;
    },
    { scope: ref, dependencies: [reduced] },
  );

  const close = () => setOpen(false);

  return (
    <header ref={ref} className="absolute top-0 left-0 right-0 z-30">
      <div className="flex items-center justify-between px-5 py-5 lg:px-12 lg:py-7 hairline-b">
        <a
          href="#top"
          data-nav-item
          className="type-display text-base lg:text-lg font-extrabold tracking-[-0.01em] text-graphite"
        >
          Strata
        </a>

        {/* desktop */}
        <nav aria-label="Primary" className="hidden lg:flex gap-10">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} data-nav-item className="nav-link type-mono text-graphite">
              {l.label}
            </a>
          ))}
        </nav>

        {/* mobile */}
        <button
          type="button"
          data-nav-item
          className="lg:hidden type-mono text-graphite"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden fixed inset-0 z-40 bg-graphite transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-rebar/40">
          <span className="type-display text-base font-extrabold text-limewash">Strata</span>
          <button type="button" className="type-mono text-limewash" onClick={close}>
            Close
          </button>
        </div>
        <nav aria-label="Mobile" className="flex flex-col gap-2 px-5 pt-16">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={close}
              className="type-display text-5xl font-extrabold text-limewash py-3"
            >
              <span className="type-mono text-rebar mr-4 align-middle">0{i + 1}</span>
              {l.label}
            </a>
          ))}
        </nav>
        <p className="type-mono absolute bottom-8 left-5 text-rebar">
          Architecture &amp; spatial practice - BLR / SGP
        </p>
      </div>
    </header>
  );
}
