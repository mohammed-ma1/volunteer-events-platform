/**
 * Kuwait-calendar dates for the June–July 2026 student workshop week (matches
 * `مواعيد الورش` in `جدول الورش.xlsx` / `ku_student_week_workshops.php`).
 */
export const KU_WORKSHOP_WEEK_DAY_KEYS: readonly string[] = [
  '2026-06-28',
  '2026-06-29',
  '2026-06-30',
  '2026-07-01',
  '2026-07-02',
];

const weekKeySet = new Set(KU_WORKSHOP_WEEK_DAY_KEYS);

export function isKuWorkshopWeekDayKey(dayKey: string): boolean {
  return weekKeySet.has(dayKey);
}

/** Noon Kuwait time — stable calendar key + date sub-labels. */
export function kuWorkshopWeekNoonIso(dayKey: string): string {
  return `${dayKey}T12:00:00+03:00`;
}
