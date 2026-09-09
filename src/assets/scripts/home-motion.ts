import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let cleanupCurrentMotion: (() => void) | null = null;

const initHomeMotion = () => {
  cleanupCurrentMotion?.();
  cleanupCurrentMotion = null;

  const hero = document.querySelector<HTMLElement>('.hero');
  const character = document.querySelector<HTMLElement>('.hero-character');
  if (!hero || !character) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId: number | null = null;

  const updateLoop = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    character.style.setProperty('--px', `${currentX.toFixed(2)}px`);
    character.style.setProperty('--py', `${currentY.toFixed(2)}px`);

    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      rafId = requestAnimationFrame(updateLoop);
    } else {
      rafId = null;
    }
  };

  const startLoop = () => {
    if (rafId === null) rafId = requestAnimationFrame(updateLoop);
  };

  const onPointerMove = (event: PointerEvent) => {
    const bounds = hero.getBoundingClientRect();
    targetX = (event.clientX - bounds.left - bounds.width / 2) * 0.015;
    targetY = (event.clientY - bounds.top - bounds.height / 2) * 0.01;
    startLoop();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    startLoop();
  };

  const onCharacterClick = () => {
    gsap.killTweensOf(character);
    gsap.fromTo(
      character,
      { '--character-click-scale': 0.94, '--character-click-rotate': '-1.2deg' },
      {
        '--character-click-scale': 1,
        '--character-click-rotate': '0deg',
        duration: 0.9,
        ease: 'elastic.out(1.2, 0.4)',
      },
    );
  };

  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
  character.addEventListener('click', onCharacterClick);

  const context = gsap.context(() => {
    if (reduceMotion) return;

    gsap.from('.hello', {
      x: -30,
      opacity: 0,
      duration: 1.1,
      ease: 'power3.out',
    });

    gsap.from('.world', {
      x: 30,
      opacity: 0,
      duration: 1.1,
      delay: 0.1,
      ease: 'power3.out',
    });

    gsap.from(character, {
      opacity: 0,
      duration: 1.2,
      delay: 0.15,
      ease: 'power3.out',
    });

    gsap.from('.hero-copy, .hero-actions, .hero-aside', {
      y: 20,
      opacity: 0,
      duration: 0.9,
      delay: 0.35,
      stagger: 0.1,
      ease: 'power2.out',
    });

    const revealItems = document.querySelectorAll<HTMLElement>('.daily, .step, .side-story, .project-display');
    revealItems.forEach((item) => {
      gsap.from(item, {
        y: 28,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      });
    });
  });

  cleanupCurrentMotion = () => {
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onPointerLeave);
    character.removeEventListener('click', onCharacterClick);
    if (rafId !== null) cancelAnimationFrame(rafId);
    context.revert();
  };
};

document.addEventListener('astro:before-swap', () => cleanupCurrentMotion?.());
document.addEventListener('astro:page-load', initHomeMotion);
initHomeMotion();
