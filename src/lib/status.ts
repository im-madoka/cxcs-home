export type ActivityStatus = 'upcoming' | 'ongoing' | 'ended' | 'cancelled';
export type RecruitmentStatus = 'upcoming' | 'open' | 'closed';

export function getActivityStatus(
  startAt: Date | string,
  endAt: Date | string,
  now = new Date(),
  cancelled = false,
): ActivityStatus {
  if (cancelled) return 'cancelled';
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const current = new Date(now).getTime();
  if (current < start) return 'upcoming';
  if (current < end) return 'ongoing';
  return 'ended';
}

export function getRecruitmentStatus(
  opensAt: Date | string,
  closesAt: Date | string,
  now = new Date(),
): RecruitmentStatus {
  const opens = new Date(opensAt).getTime();
  const closes = new Date(closesAt).getTime();
  const current = new Date(now).getTime();
  if (current < opens) return 'upcoming';
  if (current < closes) return 'open';
  return 'closed';
}
