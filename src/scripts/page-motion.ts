import { gsap } from 'gsap';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // Enhance inner pages (homepage is dedicatedly driven by home-motion.ts)
  const isHomePage = window.location.pathname === '/' || window.location.pathname === '';

  if (!isHomePage) {
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
  const progress = document.querySelector<HTMLElement>('.reading-progress');
  if (progress) {
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0})`;
    };
    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
  }
}
