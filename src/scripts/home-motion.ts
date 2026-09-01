import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduceMotion) {
  gsap.from('.hero h1, .hero-copy, .hero-actions, .scroll-cue', {
    y: 20,
    opacity: 0,
    duration: 0.75,
    stagger: 0.1,
    ease: 'power2.out',
  });
  gsap.from('.hero-visual-card', { scale: 0.88, rotate: -3, opacity: 0, duration: 1, delay: 0.35, ease: 'power3.out' });
  gsap.to('.hero-visual-card', {
    y: -15,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
  document
    .querySelectorAll<HTMLElement>(
      '.bento-card, .journey-step, .article-card, .project-card, .eco-card, .episode-card, .audience-card',
    )
    .forEach((element) =>
      gsap.from(element, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      }),
    );
}
