# STRATA — Architecture & Spatial Practice

A one-page site for a fictional architecture studio, built as a drawing set: every section is a numbered sheet (DWG 00–07), annotated in mono, dimensioned with 1px hairlines. The brand thesis — *we build silence into cities* — is told through one object: a procedural modernist house that stands complete in the hero, comes apart piece by piece — cantilever, roof, core, walls, columns, slabs — as you scroll the manifesto (an exploded axonometric, drawn live), and returns as the stacked-strata mark in the footer.

**Live:** _deploy URL_ · **Category:** Architecture firm

## Stack — and why

| Choice | Reason |
| --- | --- |
| Next.js 15 (App Router) + TypeScript | Static-first rendering, `next/image`, `next/font` — performance is free instead of fought for |
| Tailwind CSS v4 | Design tokens as CSS variables in `@theme`; zero runtime |
| GSAP 3 + ScrollTrigger | Scrubbed, pinned scroll timelines are its core strength; one easing language (`cubic-bezier(0.65, 0, 0.15, 1)`) across the site |
| Lenis | Production standard for smooth scroll; syncs to ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)`; wheel-only — touch keeps native momentum |
| React Three Fiber + three | Declarative Three.js with React lifecycle safety. The monolith is procedural geometry — zero downloaded models |

No Framer Motion — one motion system keeps the easing language coherent. No other animation libraries.

## Animation map

| Section | Technique | Library feature |
| --- | --- | --- |
| Preloader | Counter 0→100, wordmark clip-reveal, overlay exit; skipped on revisit | timeline, `snap`, sessionStorage |
| Hero | Headline lines rise from clipped containers; house fades/scales in; pointer parallax | timeline handoff from preloader, mutable-ref bridge into `useFrame` |
| Manifesto | Pinned 250vh; word-by-word reveal **and** house deconstruction driven by one scrubbed progress value | `pin`, `scrub`, shared ref consumed in R3F with 0.08 damping |
| Works | Desktop: pinned horizontal travel, per-card clip reveal, inner image counter-parallax. Mobile: vertical stack, native swipe | `containerAnimation`, `gsap.matchMedia()` |
| Featured | Three scrubbed depth layers (image −12→12, title 20→−20, spec card 35→−35) | multi-target scrub |
| Numbers | Count-up once; floor plan self-draws with scroll | `snap`, `stroke-dashoffset` scrub |
| Marquee | Counter-scrolling rows; speed multiplies with scroll velocity (clamped 1–3×); paused off-screen | `repeat: -1`, `timeScale` via Lenis velocity |
| Contact | Graphite panel slides up; magnetic CTA arrow; stacked-strata mark reassembles — narrative closes | `gsap.quickTo` spring, scrub |

## The house (3D element)

Eleven procedural `boxGeometry` pieces — plinth, floor slab, walls, colonnade, living volume, roof, cantilevered upper box, service core — in Graphite `meshStandardMaterial` with a subtle Blueprint fresnel rim injected via `onBeforeCompile`. Each piece deconstructs inside its own window of the global scroll progress, in reverse construction order (cantilever first, foundation last), easing with smoothstep. One key light, one fill, fog matched to Limewash. `dpr` capped at 1.5, all per-frame mutation through refs — zero React state at 60fps. Scroll progress crosses from GSAP to R3F through a plain mutable module (`lib/monolithStore.ts`), never props. The canvas unmounts once scroll passes the manifesto. Devices with ≤4 cores get a pure-CSS fallback instead of WebGL.

## Reduced motion

`prefers-reduced-motion: reduce` is honored for real: the preloader shows a brief card and exits, all pin/scrub choreography is replaced with simple opacity fades (via `gsap.matchMedia` conditions, so pins are never even created), the monolith renders one static frame, and the marquee stops. Lenis is not instantiated.

## Structure

```
app/            layout (fonts, metadata, SmoothScroll), page (composition only), globals.css (tokens)
components/
  canvas/       MonolithScene (visibility + fallback) · MonolithCanvas · House
  layout/       Nav · Preloader
  sections/     Hero · Manifesto · Works · FeaturedProject · Numbers · Marquee · Contact
  ui/           MagneticButton · RevealText · DimensionLine · AnnotationLabel
hooks/          useReducedMotion
lib/            gsap (single registration + custom ease) · monolithStore · reveal · data/projects
```

Every GSAP animation lives in a `useGSAP` context scoped to its component and reverts on unmount.

## Performance

- First Load JS **182 kB** (three.js is a lazy chunk loaded only for the WebGL scene)
- Photography via `next/image` (AVIF/WebP on Vercel), explicit `sizes`, grayscale applied in CSS so hover can lift it
- Zero CLS: intrinsic image dimensions, `font-display: swap`
- No videos, no Lottie, no analytics

## Local setup

```bash
npm install
npm run dev
```

Photography: Unsplash (architecture, recolored to the brand's monochrome system in CSS).
