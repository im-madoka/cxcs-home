import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  // Hero headline and buttons entrance
  gsap.from('.hero h1, .hero-copy, .hero-actions, .scroll-cue', {
    y: 24,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out',
  });

  // Hero visual entrance
  gsap.from('.hero-decorations', {
    scale: 0.88,
    opacity: 0,
    duration: 1.2,
    ease: 'power3.out',
  });

  gsap.from('.hero-mascot', {
    y: 50,
    opacity: 0,
    duration: 1.1,
    delay: 0.15,
    ease: 'power3.out',
  });

  gsap.from('.mascot-tag', {
    y: 16,
    opacity: 0,
    duration: 0.8,
    delay: 0.45,
    ease: 'power2.out',
  });

  // Mascot idle organic breathing & floating
  gsap.to('.hero-mascot', {
    y: -10,
    duration: 3.4,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
  });

  // Scroll parallax effects
  gsap.to('.hero-decorations', {
    y: 32,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  gsap.to('.hero-mascot-container', {
    y: -36,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 },
  });

  // Interactive subtle parallax & dynamic lighting on pointer move
  const heroVisual = document.querySelector<HTMLElement>('[data-hero-visual]');
  const decorLight = document.querySelector<HTMLElement>('[data-decor-light]');
  const mascotContainer = document.querySelector<HTMLElement>('[data-mascot-container]');

  if (heroVisual) {
    let bounds = heroVisual.getBoundingClientRect();
    const updateBounds = () => {
      bounds = heroVisual.getBoundingClientRect();
    };
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, { passive: true });

    let targetMascotX = 0;
    let targetMascotY = 0;
    let currentMascotX = 0;
    let currentMascotY = 0;
    let rafId: number | null = null;

    const renderLoop = () => {
      // Spring lerp
      currentMascotX += (targetMascotX - currentMascotX) * 0.08;
      currentMascotY += (targetMascotY - currentMascotY) * 0.08;

      if (mascotContainer) {
        mascotContainer.style.transform = `translate3d(${currentMascotX.toFixed(1)}px, ${currentMascotY.toFixed(1)}px, 0)`;
      }

      if (
        Math.abs(targetMascotX - currentMascotX) > 0.05 ||
        Math.abs(targetMascotY - currentMascotY) > 0.05
      ) {
        rafId = requestAnimationFrame(renderLoop);
      } else {
        rafId = null;
      }
    };

    const startLoop = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(renderLoop);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      const normX = (x / bounds.width) * 2 - 1; // -1 to 1
      const normY = (y / bounds.height) * 2 - 1; // -1 to 1

      // Subtle natural displacement
      targetMascotX = normX * 14;
      targetMascotY = normY * 10;

      // Ambient light position follow
      if (decorLight) {
        const lightX = (x / bounds.width) * 100;
        const lightY = (y / bounds.height) * 100;
        decorLight.style.setProperty('--light-x', `${lightX.toFixed(1)}%`);
        decorLight.style.setProperty('--light-y', `${lightY.toFixed(1)}%`);
        decorLight.style.opacity = '0.9';
      }

      startLoop();
    };

    const onPointerLeave = () => {
      targetMascotX = 0;
      targetMascotY = 0;
      if (decorLight) {
        decorLight.style.opacity = '0.6';
      }
      startLoop();
    };

    // Spring tap / click reaction

    const mascot = document.querySelector<HTMLElement>('[data-hero-mascot]');
    let clickCountStorage = localStorage.getItem("click_count");
    let clickCount: number = clickCountStorage ? parseInt(clickCountStorage) : 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    const IDLE_TIMEOUT_MS = 150000; // 单位是毫秒
    const tapSound = new Audio('/assets/characters/shurin-aran/clickaudio.mp3');  //the click sound effect what is darty
    const tapSound2 = new Audio('/assets/characters/shurin-aran/clickaudio2.mp3'); //the click sound effect that is cute
    if (mascot) {
      mascot.addEventListener('click', () => {
        if (resetTimer) {
          clearTimeout(resetTimer);
          resetTimer = null;
        }
        resetTimer = setTimeout(() => {
          clickCount = 0;
          localStorage.setItem("click_count", "0");
        }, IDLE_TIMEOUT_MS);

        clickCount++;
        if (clickCount > 30) {
          tapSound.currentTime = 0;
          tapSound.play().catch((err) => console.log('Failed to play tap sound:', err));
          localStorage.setItem("click_count", `${clickCount}`);
        }
        else {
          tapSound2.currentTime = 0;
          tapSound2.play().catch((err) => console.log('Failed to play tap sound:', err));
        }
        // Natural elastic spring bounce
        gsap.killTweensOf(mascot);
        gsap.fromTo(
          mascot,
          { scale: 0.93, rotate: -1.5 },
          {
            scale: 1,
            rotate: 0,
            duration: 1.1,
            ease: 'elastic.out(1.4, 0.38)',
            onComplete: () => {
              // resume idle floating
              gsap.to(mascot, {
                y: -10,
                duration: 3.4,
                ease: 'sine.inOut',
                repeat: -1,
                yoyo: true,
              });
            },
          }
        );
      });
    }

    heroVisual.addEventListener('pointermove', onPointerMove);
    heroVisual.addEventListener('pointerleave', onPointerLeave);
  }

  // Bento grid staggered entrance
  gsap.from('.bento-card', {
    y: 32,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.bento-grid', start: 'top 85%', once: true },
  });

  // Journey steps staggered entrance
  gsap.from('.journey-step', {
    y: 28,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.journey', start: 'top 85%', once: true },
  });

  // Ecosystem cards staggered entrance
  gsap.from('.eco-card', {
    y: 28,
    opacity: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power2.out',
    scrollTrigger: { trigger: '.ecosystem-grid', start: 'top 85%', once: true },
  });

  // Standalone content cards entrance
  document
    .querySelectorAll<HTMLElement>('.article-card, .project-card, .story-card, .episode-card, .audience-card')
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
