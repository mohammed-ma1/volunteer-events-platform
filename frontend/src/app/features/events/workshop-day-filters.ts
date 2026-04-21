/** Kuwait wall time for workshop day grouping. */
const KUWAIT_TZ = 'Asia/Kuwait';

/** Stable key for filtering (YYYY-MM-DD in Kuwait). */
export function calendarDayKeyKuwait(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: KUWAIT_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')?.value ?? '';
  const m = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${y}-${m}-${day}`;
}

/** Secondary line under "Day N" (e.g. 26 April 2026 / ٢٦ أبريل ٢٠٢٦). */
export function formatDaySubLabelKuwait(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  if (locale === 'ar') {
    return new Intl.DateTimeFormat('ar-KW-u-nu-latn', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: KUWAIT_TZ,
    }).format(d);
  }
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: KUWAIT_TZ,
  }).format(d);
}

/** Short workshop count for day-filter chips (e.g. "12 ورشة" / "12 workshops"). */
export function formatWorkshopDayCountLabel(count: number, locale: 'ar' | 'en'): string {
  if (locale === 'ar') {
    return `${count} ورشة`;
  }
  return count === 1 ? '1 workshop' : `${count} workshops`;
}
