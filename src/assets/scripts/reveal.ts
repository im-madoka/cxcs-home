import { gsap } from 'gsap';

/** Animate caller-owned elements with the shared inner-page entrance easing. */
export const reveal = (elements: NodeListOf<Element> | undefined, options: gsap.TweenVars) => {
  if (!elements?.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.from(elements, {
    opacity: 0,
    ease: 'power2.out',
    ...options,
  });
};
