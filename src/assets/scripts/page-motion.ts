import { gsap } from 'gsap';

let progressElement: HTMLElement | null = null;
let progressHandler: (() => void) | null = null;

const initPageMotion = () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Enhance inner pages (homepage is dedicatedly driven by home-motion.ts)
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '';

  if (!reduceMotion && !isHomePage) {
    // Page hero entrance
    const hero = document.querySelector('.page-hero, .detail-hero');
    if (hero) {
      const heroItems = hero.querySelectorAll(
        '.eyebrow, h1, .page-hero-copy, .detail-header p, .detail-byline, .about-seal, .page-hero-art',
      );
      if (heroItems.length > 0) {
        gsap.from(heroItems, {
          y: 20,
          opacity: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
        });
      }
    }

    // Editorial cards, showcase cards, timeline rows, values grid
    const targetSelectors =
      '.editorial-item, .showcase-card, .timeline-row, .value-card, .character-card, .join-capabilities article';
    const items = document.querySelectorAll<HTMLElement>(targetSelectors);

    if (items.length > 0) {
      gsap.from(items, {
        y: 24,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        delay: 0.15,
        ease: 'power2.out',
      });
    }
  }

  // Universal reading progress bar
  if (progressHandler) {
    window.removeEventListener('scroll', progressHandler);
    progressHandler = null;
  }
  progressElement = document.querySelector<HTMLElement>('.reading-progress');
  if (progressElement) {
    progressHandler = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressElement!.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    progressHandler();
    window.addEventListener('scroll', progressHandler, { passive: true });
  }
};

initPageMotion();
document.addEventListener('astro:page-load', initPageMotion);
