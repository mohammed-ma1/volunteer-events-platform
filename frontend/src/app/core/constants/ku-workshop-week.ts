/**
 * Kuwait-calendar dates for the April 2026 student workshop week (matches
 * `package-100-workshops` in `EventSeeder` and product copy).
 */
export const KU_WORKSHOP_WEEK_DAY_KEYS: readonly string[] = [
  '2026-04-26',
  '2026-04-27',
  '2026-04-28',
  '2026-04-29',
  '2026-04-30',
];

const weekKeySet = new Set(KU_WORKSHOP_WEEK_DAY_KEYS);

export function isKuWorkshopWeekDayKey(dayKey: string): boolean {
  return weekKeySet.has(dayKey);
}

/** Noon Kuwait time — stable calendar key + date sub-labels. */
export function kuWorkshopWeekNoonIso(dayKey: string): string {
  return `${dayKey}T12:00:00+03:00`;
}
