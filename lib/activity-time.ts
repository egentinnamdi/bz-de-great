import { format, isToday, isValid, isYesterday } from 'date-fns';

export type ActivityDayGroup = 'TODAY' | 'YESTERDAY' | 'EARLIER';

/**
 * Resolves a valid Date for a staff activity entry, preferring the authoritative
 * ISO `createdAt` timestamp over formatted display text.
 */
export function resolveActivityDate(
  createdAt?: string,
  fallbackTimestamp?: string
): Date | null {
  if (createdAt) {
    const parsed = new Date(createdAt);
    if (isValid(parsed)) return parsed;
  }

  if (fallbackTimestamp) {
    const trimmed = fallbackTimestamp.trim();
    // Avoid coercing bare clock strings like "10:30 AM" or stale "Today" strings into arbitrary dates
    const looksLikeFullDate =
      /\d{4}-\d{2}-\d{2}/.test(trimmed) ||
      /\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4}/.test(trimmed) ||
      /[A-Za-z]{3,9}\s+\d{1,2},\s*\d{4}/.test(trimmed);

    if (looksLikeFullDate) {
      const parsed = new Date(trimmed);
      if (isValid(parsed)) return parsed;
    }
  }

  return null;
}

/**
 * Classifies an activity item into TODAY / YESTERDAY / EARLIER against the
 * viewer's real current clock, instead of relying on stale static text labels.
 */
export function getActivityDayGroup(
  createdAt?: string,
  fallbackTimestamp?: string
): ActivityDayGroup {
  const date = resolveActivityDate(createdAt, fallbackTimestamp);
  if (date) {
    if (isToday(date)) return 'TODAY';
    if (isYesterday(date)) return 'YESTERDAY';
    return 'EARLIER';
  }

  // Last-resort fallback only when no ISO timestamp exists at all
  const lower = (fallbackTimestamp || '').toLowerCase();
  if (lower.startsWith('yesterday')) return 'YESTERDAY';
  return 'EARLIER';
}

/**
 * Formats an activity entry's timestamp cleanly in the viewer's local timezone.
 * When `compactInGroup` is true, omits redundant "Today," / "Yesterday," prefixes
 * inside dedicated day sections.
 */
export function formatActivityTimestamp(
  createdAt?: string,
  fallbackTimestamp?: string,
  opts?: { compactInGroup?: boolean }
): string {
  const date = resolveActivityDate(createdAt, fallbackTimestamp);
  if (date) {
    const timePart = format(date, 'h:mm a');
    if (isToday(date)) {
      return opts?.compactInGroup ? timePart : `Today, ${timePart}`;
    }
    if (isYesterday(date)) {
      return opts?.compactInGroup ? timePart : `Yesterday, ${timePart}`;
    }
    return format(date, 'd MMM yyyy, h:mm a');
  }

  if (fallbackTimestamp) {
    return opts?.compactInGroup
      ? fallbackTimestamp.replace(/^(today|yesterday),?\s*/i, '') || fallbackTimestamp
      : fallbackTimestamp;
  }

  return 'Recorded';
}

export function formatFullActivityDateTime(
  createdAt?: string,
  fallbackTimestamp?: string
): string {
  const date = resolveActivityDate(createdAt, fallbackTimestamp);
  if (date) {
    return format(date, "EEE, d MMM yyyy 'at' h:mm a");
  }
  return fallbackTimestamp || '';
}
