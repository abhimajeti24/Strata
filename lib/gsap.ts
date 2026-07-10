import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(ScrollTrigger, CustomEase);

/**
 * Single easing language for the whole site.
 * A steep architectural ease — fast commitment, long settle.
 */
export const strataEase = CustomEase.create("strata", "0.65, 0, 0.15, 1");

export { gsap, ScrollTrigger };
