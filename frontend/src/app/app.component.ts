import { DOCUMENT } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';
import { I18nService } from './core/i18n/i18n.service';
import { SiteDisabledPageComponent } from './features/pages/site-disabled-page.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteDisabledPageComponent],
  template: `
    @if (siteDisabled) {
      <app-site-disabled-page />
    } @else {
      <router-outlet />
    }
  `,
})
export class AppComponent {
  readonly siteDisabled = environment.siteDisabled;
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
