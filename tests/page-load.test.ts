import { afterEach, describe, expect, mock, test } from 'bun:test';
import { onPageLoad } from '../src/assets/scripts/page-load';

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');

afterEach(() => {
  if (originalDocument) Object.defineProperty(globalThis, 'document', originalDocument);
  else Reflect.deleteProperty(globalThis, 'document');
});

const createDocument = (readyState: DocumentReadyState) => {
  const document = Object.assign(new EventTarget(), { readyState });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: document });
  return document;
};

describe('page-owned enhancement lifecycle', () => {
  test('preserves immediate initialization and the initial Astro page-load on a full load', () => {
    const document = createDocument('interactive');
    const initialize = mock(() => {});

    onPageLoad(initialize);
    expect(initialize).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('astro:page-load'));
    expect(initialize).toHaveBeenCalledTimes(2);
  });

  test('plays once when a component first loads during navigation and again on subsequent visits', () => {
    const document = createDocument('complete');
    const initialize = mock(() => {});

    onPageLoad(initialize);
    expect(initialize).not.toHaveBeenCalled();

    document.dispatchEvent(new Event('astro:page-load'));
    expect(initialize).toHaveBeenCalledTimes(1);

    document.dispatchEvent(new Event('astro:before-swap'));
    document.dispatchEvent(new Event('astro:page-load'));
    expect(initialize).toHaveBeenCalledTimes(2);
  });
});
