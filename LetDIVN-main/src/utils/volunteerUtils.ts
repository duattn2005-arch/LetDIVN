/**
 * Historical records/sheet rows from before the switch to storing birth
 * year directly may still hold a calculated age (e.g. "22") in that same
 * slot. Auto-detect that shape and back-calculate the birth year so old
 * data still displays sensibly instead of looking like "born in year 22".
 */
export function normalizeBirthYear(raw: string | number | undefined | null): string {
  const value = String(raw ?? '').trim();
  if (!value) return '';

  const num = Number(value);
  if (!Number.isFinite(num)) return value;

  const currentYear = new Date().getFullYear();
  if (num >= 1920 && num <= currentYear) return String(num);
  if (num >= 1 && num <= 99) return String(currentYear - num);
  return value;
}
