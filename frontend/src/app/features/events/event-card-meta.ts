/** Kuwait wall time for listings. */
const KUWAIT_TZ = 'Asia/Kuwait';

export function formatWeekdayColonDate(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  const loc = locale === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB';
  const weekday = new Intl.DateTimeFormat(loc, { weekday: 'long', timeZone: KUWAIT_TZ }).format(d);
  const day = new Intl.DateTimeFormat('en-GB', { day: '2-digit', timeZone: KUWAIT_TZ }).format(d);
  const month = new Intl.DateTimeFormat('en-GB', { month: '2-digit', timeZone: KUWAIT_TZ }).format(d);
  const year = new Intl.DateTimeFormat('en-GB', { year: 'numeric', timeZone: KUWAIT_TZ }).format(d);
  return `${weekday}: ${day}-${month}-${year}`;
}

/** Long calendar date for cards (e.g. 26 April 2026). */
export function formatCardDateLong(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  const loc = locale === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(loc, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: KUWAIT_TZ,
  }).format(d);
}

export function formatTimeKuwait(iso: string, locale: 'ar' | 'en'): string {
  const d = new Date(iso);
  const loc = locale === 'ar' ? 'ar-KW-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(loc, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: KUWAIT_TZ,
  }).format(d);
}

/** Parse presenter name from seeded Arabic/English summary lines. */
export function parsePresenterFromSummaries(
  summaryAr: string | null | undefined,
  summaryEn: string | null | undefined,
  summary: string | null | undefined,
  preferAr: boolean,
): string | null {
  const tryAr = (s: string | null | undefined) => {
    if (!s) {
      return null;
    }
    // Old format: "مقدم الورشة: NAME · ..."
    let m = s.match(/مقدم الورشة:\s*([^·]+)/);
    if (m) return m[1].trim();
    // New format from EventSeeder: "[personal] ورشة TITLE يقدمها NAME."
    m = s.match(/يقدمها\s+([^.·]+)\.?/);
    return m ? m[1].trim() : null;
  };
  const tryEn = (s: string | null | undefined) => {
    if (!s) {
      return null;
    }
    // Old format
    let m = s.match(/Facilitator:\s*([^·]+)/i);
    if (m) return m[1].trim();
    // New format: "[personal] TITLE workshop led by NAME."
    m = s.match(/led by\s+([^.·]+)\.?/i);
    return m ? m[1].trim() : null;
  };
  if (preferAr) {
    return tryAr(summaryAr) ?? tryAr(summary) ?? tryEn(summaryEn) ?? tryEn(summary);
  }
  return tryEn(summaryEn) ?? tryEn(summary) ?? tryAr(summaryAr) ?? tryAr(summary);
}
