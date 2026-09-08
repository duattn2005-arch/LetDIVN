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
