import type { TransitionBeforePreparationEvent } from 'astro:transitions/client';

const START_PROGRESS = 0.08;
const PREPARED_PROGRESS = 0.9;
const TRICKLE_LIMIT = 0.86;
const TRICKLE_INTERVAL = 180;
const RESET_DELAY = 320;

let activeSignal: AbortSignal | null = null;
let progress = 0;
let trickleTimer: number | undefined;
let resetTimer: number | undefined;

const getProgressElement = () => document.querySelector<HTMLElement>('.navigation-progress');

const clearTimers = () => {
  if (trickleTimer !== undefined) {
    window.clearInterval(trickleTimer);
    trickleTimer = undefined;
  }
  if (resetTimer !== undefined) {
    window.clearTimeout(resetTimer);
    resetTimer = undefined;
  }
};

const renderProgress = (value: number, state: 'idle' | 'active' | 'complete') => {
  progress = value;
  const element = getProgressElement();
  if (!element) return;

  element.style.setProperty('--navigation-progress', String(value));
  element.dataset.state = state;
};

const resetProgress = (signal: AbortSignal) => {
  if (signal !== activeSignal) return;

  clearTimers();
  activeSignal = null;
  renderProgress(0, 'idle');
};

document.addEventListener('astro:before-preparation', (rawEvent) => {
  const event = rawEvent as TransitionBeforePreparationEvent;

  clearTimers();
  activeSignal = event.signal;
  renderProgress(START_PROGRESS, 'active');

  event.signal.addEventListener('abort', () => resetProgress(event.signal), { once: true });
  trickleTimer = window.setInterval(() => {
    if (event.signal !== activeSignal) return;

    const nextProgress = progress + Math.max(0.01, (TRICKLE_LIMIT - progress) * 0.12);
    renderProgress(Math.min(TRICKLE_LIMIT, nextProgress), 'active');
  }, TRICKLE_INTERVAL);
});

document.addEventListener('astro:after-preparation', () => {
  if (!activeSignal) return;
  renderProgress(Math.max(progress, PREPARED_PROGRESS), 'active');
});

document.addEventListener('astro:page-load', () => {
  if (!activeSignal) return;

  const completedSignal = activeSignal;
  clearTimers();
  renderProgress(1, 'complete');
  resetTimer = window.setTimeout(() => resetProgress(completedSignal), RESET_DELAY);
});
