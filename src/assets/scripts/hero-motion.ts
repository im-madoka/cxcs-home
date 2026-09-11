type Point = { x: number; y: number };
type SensorAPI = { requestPermission?: () => Promise<'granted' | 'denied'> };

const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
const deadzone = (value: number, threshold: number) => Math.sign(value) * Math.max(0, Math.abs(value) - threshold);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const angleDelta = (value: number, baseline: number, period: number) =>
  ((((value - baseline + period / 2) % period) + period) % period) - period / 2;

/** Share one eased translation between the mouse, device tilt, and linear acceleration. */
export const initHeroMotion = (hero: HTMLElement, character: HTMLElement) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sensorWindow = window as Window & {
    DeviceOrientationEvent?: SensorAPI;
    DeviceMotionEvent?: SensorAPI;
    orientation?: number;
  };
  let disposed = false;
  let inView = true;
  let listening = false;
  let pointer: Point | null = null;
  let tilt: Point = { x: 0, y: 0 };
  let shake: Point = { x: 0, y: 0 };
  let current: Point = { x: 0, y: 0 };
  let baseline: Point | null = null;
  let gravity: Point | null = null;
  let lastMotionTime: number | null = null;
  let lastFrameTime: number | null = null;
  let rafId: number | null = null;
  const permissionAttempted = new Set<SensorAPI>();
  const received = { orientation: false, motion: false };

  const active = () => !disposed && inView && !document.hidden && !reducedMotion.matches;
  const toScreen = (x: number, y: number): Point => {
    const angle = window.screen.orientation?.angle ?? sensorWindow.orientation ?? 0;
    const radians = (angle * Math.PI) / 180;
    return {
      x: x * Math.cos(radians) + y * Math.sin(radians),
      y: y * Math.cos(radians) - x * Math.sin(radians),
    };
  };
  const render = () => {
    character.style.setProperty('--px', `${current.x.toFixed(2)}px`);
    character.style.setProperty('--py', `${current.y.toFixed(2)}px`);
  };

  const update = (time: number) => {
    rafId = null;
    if (!active()) return;
    const elapsed = lastFrameTime === null ? 1000 / 60 : Math.min(time - lastFrameTime, 50);
    lastFrameTime = time;
    const target = pointer ?? { x: clamp(tilt.x + shake.x, 24), y: clamp(tilt.y + shake.y, 18) };
    const easing = 1 - Math.exp(-elapsed / 160);
    current.x += (target.x - current.x) * easing;
    current.y += (target.y - current.y) * easing;

    // Decay even if the browser stops sending sensor samples after a movement.
    const decay = Math.exp(-elapsed / 180);
    shake.x *= decay;
    shake.y *= decay;
    if (Math.abs(shake.x) < 0.02) shake.x = 0;
    if (Math.abs(shake.y) < 0.02) shake.y = 0;
    const moving =
      Math.abs(target.x - current.x) > 0.05 || Math.abs(target.y - current.y) > 0.05 || shake.x !== 0 || shake.y !== 0;
    if (!moving) current = target;
    render();
    if (moving) rafId = requestAnimationFrame(update);
    else lastFrameTime = null;
  };
  const start = () => {
    if (active() && rafId === null) rafId = requestAnimationFrame(update);
  };
  const reset = () => {
    if (rafId !== null) cancelAnimationFrame(rafId);
    rafId = null;
    lastFrameTime = null;
    lastMotionTime = null;
    baseline = null;
    gravity = null;
    pointer = null;
    tilt = { x: 0, y: 0 };
    shake = { x: 0, y: 0 };
    current = { x: 0, y: 0 };
    render();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!active() || event.pointerType === 'touch') return;
    const bounds = hero.getBoundingClientRect();
    pointer = {
      x: clamp((event.clientX - bounds.left - bounds.width / 2) * 0.0225, 24),
      y: clamp((event.clientY - bounds.top - bounds.height / 2) * 0.015, 18),
    };
    start();
  };
  const onPointerLeave = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    pointer = null;
    start();
  };
  const onOrientation = (event: DeviceOrientationEvent) => {
    if (!active() || !finite(event.beta) || !finite(event.gamma)) return;
    received.orientation = true;
    const sample = { x: event.gamma, y: event.beta };
    baseline ??= sample;
    const delta = toScreen(angleDelta(sample.x, baseline.x, 180), angleDelta(sample.y, baseline.y, 360));
    tilt = {
      x: clamp((deadzone(delta.x, 0.5) / 25) * 18, 18),
      y: clamp((deadzone(delta.y, 0.5) / 25) * 12, 12),
    };
    start();
  };
  const onMotion = (event: DeviceMotionEvent) => {
    if (!active()) return;
    const now = event.timeStamp;
    const elapsed = lastMotionTime === null ? 1000 / 60 : Math.max(1, Math.min(now - lastMotionTime, 100));
    lastMotionTime = now;
    let acceleration = event.acceleration;
    if (!finite(acceleration?.x) || !finite(acceleration?.y)) {
      const total = event.accelerationIncludingGravity;
      if (!finite(total?.x) || !finite(total?.y)) return;
      // A low-pass estimate removes constant gravity when linear acceleration is unavailable.
      gravity ??= { x: total.x, y: total.y };
      const smoothing = 1 - Math.exp(-elapsed / 350);
      gravity.x += (total.x - gravity.x) * smoothing;
      gravity.y += (total.y - gravity.y) * smoothing;
      acceleration = { x: total.x - gravity.x, y: total.y - gravity.y, z: 0 };
    }
    if (!finite(acceleration.x) || !finite(acceleration.y)) return;
    received.motion = true;
    // Device y points upward; CSS y points downward. Oppose acceleration for a little inertia.
    const movement = toScreen(acceleration.x, -acceleration.y);
    const x = deadzone(movement.x, 0.12);
    const y = deadzone(movement.y, 0.12);
    if (x === 0 && y === 0) return;
    shake = { x: clamp(-x * 3.5, 14), y: clamp(-y * 3.5, 12) };
    start();
  };

  const syncSensors = () => {
    const shouldListen = active() && window.isSecureContext;
    if (shouldListen === listening) return;
    listening = shouldListen;
    if (listening) {
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
      window.addEventListener('devicemotion', onMotion, { passive: true });
    } else {
      window.removeEventListener('deviceorientation', onOrientation);
      window.removeEventListener('devicemotion', onMotion);
    }
  };
  const onActivityChange = () => {
    reset();
    syncSensors();
  };
  const onCharacterClick = () => {
    if (!active() || !window.isSecureContext) return;
    const apis = [
      { api: sensorWindow.DeviceOrientationEvent, hasData: received.orientation },
      { api: sensorWindow.DeviceMotionEvent, hasData: received.motion },
    ];
    for (const { api, hasData } of apis) {
      if (!api?.requestPermission || hasData || permissionAttempted.has(api)) continue;
      permissionAttempted.add(api);
      try {
        // Invoke both requests in this click's activation, before awaiting either promise (iOS).
        void api.requestPermission().then(
          (permission) => {
            if (permission === 'granted' && !disposed) syncSensors();
          },
          () => {},
        );
      } catch {
        // A blocked sensor must not interrupt the existing mascot interaction.
      }
    }
  };

  hero.addEventListener('pointermove', onPointerMove, { passive: true });
  hero.addEventListener('pointerleave', onPointerLeave, { passive: true });
  character.addEventListener('click', onCharacterClick);
  document.addEventListener('visibilitychange', onActivityChange);
  reducedMotion.addEventListener('change', onActivityChange);
  window.screen.orientation?.addEventListener('change', onActivityChange);
  window.addEventListener('orientationchange', onActivityChange);
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry || inView === entry.isIntersecting) return;
    inView = entry.isIntersecting;
    onActivityChange();
  });
  observer.observe(hero);
  syncSensors();

  return () => {
    disposed = true;
    syncSensors();
    observer.disconnect();
    hero.removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('pointerleave', onPointerLeave);
    character.removeEventListener('click', onCharacterClick);
    document.removeEventListener('visibilitychange', onActivityChange);
    reducedMotion.removeEventListener('change', onActivityChange);
    window.screen.orientation?.removeEventListener('change', onActivityChange);
    window.removeEventListener('orientationchange', onActivityChange);
    reset();
  };
};
