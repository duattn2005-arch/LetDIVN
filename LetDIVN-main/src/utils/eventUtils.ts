/**
 * Events store their date as a plain "YYYY-MM-DD" string with no timezone
 * info, so compare it against today's own local calendar date rather than
 * a full Date/time instant — a same-day event should still count as open.
 */
export function isEventExpired(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return dateStr < todayStr;
}

/**
 * Renders a plain "YYYY-MM-DD" date string as "Month D, YYYY" (e.g. "March
 * 22, 2026") — always in English, regardless of the site's active language,
 * per how dates are meant to read everywhere on the site. Built from the
 * Y/M/D components (not `new Date(dateStr)`) so it isn't shifted a day by
 * the viewer's timezone, the way parsing an ISO string as UTC would.
 */
export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}
