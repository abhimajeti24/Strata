/**
 * Mutable singleton shared between the GSAP scroll world and the R3F frame
 * loop. Written by ScrollTrigger callbacks / pointer handlers, read inside
 * useFrame — never touches React state, so nothing re-renders at 60fps.
 */
export const monolithState = {
  /** 0 = strata flush, 1 = fully deconstructed (driven by Manifesto scrub) */
  deconstruct: 0,
  /** normalized pointer, -1..1 (desktop hero parallax) */
  pointerX: 0,
  pointerY: 0,
  /** hero intro: 0 hidden → 1 settled */
  intro: 0,
};
