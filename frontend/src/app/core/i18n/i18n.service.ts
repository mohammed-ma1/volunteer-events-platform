import { Injectable, computed, signal } from '@angular/core';
import { Locale, TRANSLATIONS, TranslationKey } from './translations';

@Injectable({ providedIn: 'root' })
export class I18nService {
  readonly locale = signal<Locale>('ar');

  readonly isRtl = computed(() => this.locale() === 'ar');

  setLocale(next: Locale): void {
    this.locale.set(next);
  }

  toggleLocale(): void {
    this.locale.update((l) => (l === 'ar' ? 'en' : 'ar'));
  }

  t(key: TranslationKey): string {
    return TRANSLATIONS[this.locale()][key] ?? key;
  }
}
