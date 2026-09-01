import { describe, expect, test } from 'bun:test';
import { getActivityStatus, getRecruitmentStatus } from './status';

describe('activity status', () => {
  const start = new Date('2026-09-12T06:00:00.000Z');
  const end = new Date('2026-09-12T08:00:00.000Z');

  test('uses time boundaries and cancellation override', () => {
    expect(getActivityStatus(start, end, new Date('2026-09-12T05:59:00.000Z'))).toBe('upcoming');
    expect(getActivityStatus(start, end, new Date('2026-09-12T07:00:00.000Z'))).toBe('ongoing');
    expect(getActivityStatus(start, end, new Date('2026-09-12T09:00:00.000Z'))).toBe('ended');
    expect(getActivityStatus(start, end, new Date('2026-09-12T07:00:00.000Z'), true)).toBe('cancelled');
  });
});

describe('recruitment status', () => {
  test('returns upcoming, open, and closed', () => {
    const opens = new Date('2026-09-01T00:00:00.000Z');
    const closes = new Date('2026-09-20T00:00:00.000Z');
    expect(getRecruitmentStatus(opens, closes, new Date('2026-08-31T00:00:00.000Z'))).toBe('upcoming');
    expect(getRecruitmentStatus(opens, closes, new Date('2026-09-10T00:00:00.000Z'))).toBe('open');
    expect(getRecruitmentStatus(opens, closes, new Date('2026-09-21T00:00:00.000Z'))).toBe('closed');
  });
});
