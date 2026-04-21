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

/** Compact “starts in …” from wall-clock delta (e.g. تبدأ خلال 7ي 10س / Starts in 7d 10h). Null if not in the future. */
export function formatStartsInCompact(
  iso: string | null | undefined,
  locale: 'ar' | 'en',
  nowMs: number = Date.now(),
): string | null {
  if (!iso) {
    return null;
  }
  const diffMs = new Date(iso).getTime() - nowMs;
  if (diffMs <= 0) {
    return null;
  }
  const hoursTotal = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hoursTotal / 24);
  const hours = hoursTotal % 24;
  if (locale === 'ar') {
    return `تبدأ خلال ${days}ي ${hours}س`;
  }
  return `Starts in ${days}d ${hours}h`;
}

/** Parse presenter name from seeded Arabic/English summary lines. */
export function parsePresenterFromSummaries(
  summaryAr: string | null | undefined,
  summaryEn: string | null | undefined,
  summary: string | null | undefined,
  preferAr: boolean,
): string | null {
  const stripTrailing = (v: string): string => v.trim().replace(/[.·]+$/, '').trim();
  const tryAr = (s: string | null | undefined) => {
    if (!s) {
      return null;
    }
    // Old format: "مقدم الورشة: NAME · ..."
    let m = s.match(/مقدم الورشة:\s*([^·]+)/);
    if (m) return stripTrailing(m[1]);
    // New format from EventSeeder: "[personal] ورشة TITLE يقدمها NAME."
    // Capture greedily until the next " · " separator or end of string,
    // so honorific periods like "د." or "د.بسام" don't truncate the name.
    m = s.match(/يقدمها\s+(.+?)(?:\s+·|$)/);
    return m ? stripTrailing(m[1]) : null;
  };
  const tryEn = (s: string | null | undefined) => {
    if (!s) {
      return null;
    }
    let m = s.match(/Facilitator:\s*([^·]+)/i);
    if (m) return stripTrailing(m[1]);
    m = s.match(/led by\s+(.+?)(?:\s+·|$)/i);
    return m ? stripTrailing(m[1]) : null;
  };
  if (preferAr) {
    return tryAr(summaryAr) ?? tryAr(summary) ?? tryEn(summaryEn) ?? tryEn(summary);
  }
  return tryEn(summaryEn) ?? tryEn(summary) ?? tryAr(summaryAr) ?? tryAr(summary);
}
