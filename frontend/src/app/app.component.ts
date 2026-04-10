import { DOCUMENT } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { I18nService } from './core/i18n/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class AppComponent {
  private readonly doc = inject(DOCUMENT);
  private readonly i18n = inject(I18nService);

  constructor() {
    effect(() => {
      const locale = this.i18n.locale();
      const html = this.doc.documentElement;
      html.lang = locale;
      html.dir = locale === 'ar' ? 'rtl' : 'ltr';
    });
  }
}
