import { afterEach, describe, expect, mock, test } from 'bun:test';
import { initHeroMotion } from '../src/assets/scripts/hero-motion';

const globals = [
  'window',
  'document',
  'IntersectionObserver',
  'requestAnimationFrame',
  'cancelAnimationFrame',
] as const;
const originals = new Map(globals.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

const emit = (target: EventTarget, type: string, values = {}) => {
  const event = new Event(type);
  for (const [key, value] of Object.entries(values)) Object.defineProperty(event, key, { value });
  target.dispatchEvent(event);
};

const setup = (options: { reduced?: boolean; secure?: boolean; permissions?: boolean; sensors?: boolean } = {}) => {
  const reducedMotion = Object.assign(new EventTarget(), { matches: options.reduced ?? false });
  const orientation = Object.assign(new EventTarget(), { angle: 0 });
  const orientationPermission = mock(() => Promise.resolve('granted' as 'granted' | 'denied'));
  const motionPermission = mock(() => Promise.resolve('granted' as 'granted' | 'denied'));
  const sensorWindow = Object.assign(new EventTarget(), {
    isSecureContext: options.secure ?? true,
    matchMedia: () => reducedMotion,
    screen: { orientation },
    DeviceOrientationEvent:
      options.sensors === false ? undefined : options.permissions ? { requestPermission: orientationPermission } : {},
    DeviceMotionEvent:
      options.sensors === false ? undefined : options.permissions ? { requestPermission: motionPermission } : {},
  });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const hero = Object.assign(new EventTarget(), {
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }),
  });
  const properties = new Map<string, string>();
  const character = Object.assign(new EventTarget(), {
    style: { setProperty: (name: string, value: string) => properties.set(name, value) },
  });
  const frames = new Map<number, FrameRequestCallback>();
  let nextFrame = 0;
  let time = 0;
  let intersection: IntersectionObserverCallback;
  const disconnect = mock(() => {});
  class Observer {
    constructor(callback: IntersectionObserverCallback) {
      intersection = callback;
    }
    observe() {}
    disconnect = disconnect;
  }
  const stubs = {
    window: sensorWindow,
    document,
    IntersectionObserver: Observer,
    requestAnimationFrame: (callback: FrameRequestCallback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id: number) => frames.delete(id),
  };
  for (const [key, value] of Object.entries(stubs)) {
    Object.defineProperty(globalThis, key, { configurable: true, value });
  }
  const initialize = () => initHeroMotion(hero as unknown as HTMLElement, character as unknown as HTMLElement);
  cleanup = initialize();
  const advance = (count = 120) => {
    for (let i = 0; i < count; i++) {
      time += 1000 / 60;
      const callbacks = [...frames.values()];
      frames.clear();
      for (const callback of callbacks) callback(time);
    }
  };
  return {
    window: sensorWindow,
    document,
    hero,
    character,
    orientation,
    reducedMotion,
    orientationPermission,
    motionPermission,
    disconnect,
    initialize,
    advance,
    frames,
    position: () => ({ x: parseFloat(properties.get('--px') ?? '0'), y: parseFloat(properties.get('--py') ?? '0') }),
    tilt: (beta: number | null, gamma: number | null) => emit(sensorWindow, 'deviceorientation', { beta, gamma }),
    move: (x: number | null, y: number | null) =>
      emit(sensorWindow, 'devicemotion', { acceleration: { x, y, z: 0 }, timeStamp: time }),
    gravity: (x: number, y: number) =>
      emit(sensorWindow, 'devicemotion', {
        acceleration: null,
        accelerationIncludingGravity: { x, y, z: 0 },
        timeStamp: time,
      }),
    intersect: (isIntersecting: boolean) =>
      intersection([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver),
  };
};

describe('hero mouse and device motion', () => {
  test('calibrates to the initial grip, eases into tilt, and bounds large angles', () => {
    const scene = setup();
    scene.tilt(45, 10);
    scene.advance();
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.tilt(60, 30);
    scene.advance(1);
    const first = scene.position();
    scene.advance();
    expect(scene.position().x).toBeGreaterThan(first.x);
    expect(scene.position().y).toBeGreaterThan(first.y);
    scene.tilt(130, 80);
    scene.advance();
    expect(scene.position().x).toBeLessThanOrEqual(18);
    expect(scene.position().y).toBeLessThanOrEqual(12);
    expect(scene.frames.size).toBe(0);
  });

  test('responds to horizontal and vertical acceleration without any change in tilt, then settles', () => {
    const scene = setup();
    scene.tilt(45, 0);
    scene.move(3, 2);
    scene.advance(8);
    expect(scene.position().x).toBeLessThan(-1);
    expect(scene.position().y).toBeGreaterThan(1);
    // No more events are needed for the inertial displacement to return to center.
    scene.advance(180);
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.move(-3, -2);
    scene.advance(8);
    expect(scene.position().x).toBeGreaterThan(1);
    expect(scene.position().y).toBeLessThan(-1);
  });

  test('adds acceleration to tilt and returns to that tilt after the shake', () => {
    const scene = setup();
    scene.tilt(40, 0);
    scene.tilt(55, 15);
    scene.advance();
    const resting = scene.position();
    scene.move(-8, 8);
    scene.advance(8);
    expect(scene.position().x).toBeGreaterThan(resting.x);
    expect(scene.position().y).toBeGreaterThan(resting.y);
    expect(scene.position().x).toBeLessThanOrEqual(24);
    expect(scene.position().y).toBeLessThanOrEqual(18);
    scene.advance(180);
    expect(scene.position()).toEqual(resting);
  });

  test('filters constant gravity but reacts to translation when linear acceleration is missing', () => {
    const scene = setup();
    for (let i = 0; i < 60; i++) {
      scene.gravity(0, 9.81);
      scene.advance(1);
    }
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.gravity(3, 11.81);
    scene.advance(8);
    expect(scene.position().x).toBeLessThan(-1);
    expect(scene.position().y).toBeGreaterThan(1);
    for (let i = 0; i < 180; i++) {
      scene.gravity(0, 9.81);
      scene.advance(1);
    }
    expect(Math.abs(scene.position().x)).toBeLessThan(0.1);
    expect(Math.abs(scene.position().y)).toBeLessThan(0.1);
  });

  test('remaps both inputs and recalibrates after a screen rotation', () => {
    const scene = setup();
    scene.tilt(30, 0);
    scene.tilt(50, 20);
    scene.advance();
    scene.orientation.angle = 90;
    emit(scene.orientation, 'change');
    scene.tilt(50, 20);
    scene.advance();
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.tilt(65, 20);
    scene.advance();
    expect(scene.position().x).toBeGreaterThan(0);
    expect(scene.position().y).toBeCloseTo(0);
    emit(scene.orientation, 'change');
    scene.move(3, 0);
    scene.advance(8);
    expect(scene.position().x).toBeCloseTo(0);
    expect(scene.position().y).toBeGreaterThan(1);
  });

  test('ignores invalid data and noise, and handles angle wraparound without a jump', () => {
    const scene = setup();
    scene.tilt(null, 0);
    scene.tilt(NaN, Infinity);
    scene.move(null, null);
    scene.move(NaN, Infinity);
    scene.tilt(179, 0);
    scene.move(0.05, -0.05);
    scene.advance();
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.tilt(-179, 0);
    scene.advance();
    expect(scene.position().y).toBeGreaterThan(0);
    expect(scene.position().y).toBeLessThan(2);
  });

  test('increases mouse travel by half and ignores touch moves and leaves', () => {
    const scene = setup({ sensors: false });
    emit(scene.hero, 'pointermove', { pointerType: 'mouse', clientX: 1200, clientY: 800 });
    scene.advance();
    expect(scene.position()).toEqual({ x: 13.5, y: 6 });
    emit(scene.hero, 'pointerleave', { pointerType: 'mouse' });
    scene.advance();
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    scene.tilt(45, 0);
    scene.tilt(55, 10);
    scene.advance();
    const resting = scene.position();
    emit(scene.hero, 'pointermove', { pointerType: 'touch', clientX: 0, clientY: 0 });
    emit(scene.hero, 'pointerleave', { pointerType: 'touch' });
    scene.advance();
    expect(scene.position()).toEqual(resting);
  });

  test('pauses offscreen and in the background, recalibrates on return, and honors reduced motion', () => {
    const scene = setup();
    for (const pause of ['viewport', 'background', 'reduced'] as const) {
      scene.move(3, 2);
      if (pause === 'viewport') scene.intersect(false);
      if (pause === 'background') {
        scene.document.hidden = true;
        emit(scene.document, 'visibilitychange');
      }
      if (pause === 'reduced') {
        scene.reducedMotion.matches = true;
        emit(scene.reducedMotion, 'change');
      }
      scene.move(3, 2);
      scene.tilt(70, 40);
      scene.advance();
      expect(scene.position()).toEqual({ x: 0, y: 0 });
      expect(scene.frames.size).toBe(0);
      scene.document.hidden = false;
      scene.reducedMotion.matches = false;
      scene.intersect(true);
      emit(scene.document, 'visibilitychange');
      scene.tilt(50, 10);
      scene.advance();
      expect(scene.position()).toEqual({ x: 0, y: 0 });
    }
  });

  test('requests both iOS permissions synchronously on mascot click and only once', async () => {
    const scene = setup({ permissions: true });
    expect(scene.orientationPermission).not.toHaveBeenCalled();
    expect(scene.motionPermission).not.toHaveBeenCalled();
    emit(scene.character, 'click');
    expect(scene.orientationPermission).toHaveBeenCalledTimes(1);
    expect(scene.motionPermission).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    emit(scene.character, 'click');
    expect(scene.motionPermission).toHaveBeenCalledTimes(1);
    scene.move(3, 2);
    scene.advance(8);
    expect(scene.position().x).toBeLessThan(-1);
  });

  test('handles denied and failed permissions while keeping the mouse interaction', async () => {
    const scene = setup({ permissions: true });
    scene.orientationPermission.mockImplementation(() => Promise.resolve('denied'));
    scene.motionPermission.mockImplementation(() => Promise.reject(new Error('Blocked')));
    emit(scene.character, 'click');
    await Promise.resolve();
    emit(scene.character, 'click');
    expect(scene.motionPermission).toHaveBeenCalledTimes(1);
    emit(scene.hero, 'pointermove', { pointerType: 'mouse', clientX: 1200, clientY: 800 });
    scene.advance();
    expect(scene.position().x).toBeGreaterThan(0);
  });

  test('does not request sensors in an insecure context or with reduced motion', () => {
    for (const options of [{ secure: false }, { reduced: true }]) {
      const scene = setup({ ...options, permissions: true });
      emit(scene.character, 'click');
      scene.move(3, 2);
      scene.advance();
      expect(scene.position()).toEqual({ x: 0, y: 0 });
      expect(scene.orientationPermission).not.toHaveBeenCalled();
      expect(scene.motionPermission).not.toHaveBeenCalled();
      cleanup?.();
    }
  });

  test('cleans up all inputs and pending frames, including permission completion after navigation', async () => {
    const scene = setup({ permissions: true });
    emit(scene.character, 'click');
    scene.move(3, 2);
    cleanup?.();
    await Promise.resolve();
    scene.move(3, 2);
    scene.tilt(50, 20);
    emit(scene.hero, 'pointermove', { pointerType: 'mouse', clientX: 1200, clientY: 800 });
    emit(scene.document, 'visibilitychange');
    expect(scene.disconnect).toHaveBeenCalledTimes(1);
    expect(scene.frames.size).toBe(0);
    expect(scene.position()).toEqual({ x: 0, y: 0 });
    cleanup = scene.initialize();
    scene.move(3, 2);
    scene.advance(8);
    expect(scene.position().x).toBeLessThan(-1);
  });
});
