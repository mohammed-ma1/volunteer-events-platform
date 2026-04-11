import { Injectable, computed, signal } from '@angular/core';
import { Locale, TRANSLATIONS, TranslationKey } from './translations';

const LOCALE_STORAGE_KEY = 've_locale';

function readStoredLocale(): Locale {
  try {
    const v = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (v === 'en' || v === 'ar') {
      return v;
    }
  } catch {
    /* private mode or no storage */
  }
  return 'ar';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>(readStoredLocale());

  readonly isRtl = computed(() => this.locale() === 'ar');

  constructor() {
    this.applyDocumentLangDir(this.locale());
  }

  setLocale(next: Locale): void {
    this.persistAndApply(next);
    this.locale.set(next);
  }

  toggleLocale(): void {
    this.locale.update((l) => {
      const next = l === 'ar' ? 'en' : 'ar';
      this.persistAndApply(next);
      return next;
    });
  }

  private persistAndApply(loc: Locale): void {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, loc);
    } catch {
      /* ignore */
    }
    this.applyDocumentLangDir(loc);
  }

  private applyDocumentLangDir(loc: Locale): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.lang = loc;
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
  }

  t(key: TranslationKey): string {
    return TRANSLATIONS[this.locale()][key] ?? key;
  }
}
