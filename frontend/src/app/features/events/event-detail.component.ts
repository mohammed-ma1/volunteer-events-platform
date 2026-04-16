import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getDummyBySlug, HomeListEvent, volunteerToHome } from '../../core/data/dummy-events';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { VolunteerEvent } from '../../core/models/api.types';
import { EnrolledWorkshop } from '../../core/models/learn.types';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { LearnService } from '../../core/services/learn.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    @if (error()) {
      <p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ error() }}
      </p>
    } @else {
      @if (event(); as ev) {

      <!-- ─── Hero Banner ─── -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div class="absolute inset-0">
          @if (ev.image_url) {
            <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover opacity-25 blur-sm" loading="lazy"/>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent"></div>
        </div>

        <div class="relative z-10 px-6 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-10">
          <!-- Back Link -->
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition mb-8">
            @if (i18n.isRtl()) {
              <svg class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            } @else {
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            }
            {{ i18n.t('detail.back') }}
          </a>

          <div class="flex flex-col lg:flex-row lg:items-end lg:gap-8">
            <!-- Image -->
            <div class="shrink-0 w-full lg:w-72 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 lg:mb-0">
              @if (ev.image_url) {
                <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover" loading="lazy"/>
              } @else {
                <div class="h-full w-full bg-gradient-to-br from-brand-800 to-indigo-900 flex items-center justify-center">
                  <svg class="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
              }
            </div>

            <!-- Title + Meta -->
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                @if (ev.is_featured) {
                  <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ i18n.t('detail.featured') }}
                  </span>
                }
                @if (isOwned()) {
                  <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    {{ tr('مسجّل', 'Enrolled') }}
                  </span>
                }
              </div>

              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">{{ title(ev) }}</h1>

              <div class="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-white/60">
                @if (ev.starts_at) {
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    {{ ev.starts_at | date: 'EEEE, MMM d, y' : undefined : dateLocale() }}
                  </span>
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ ev.starts_at | date:'h:mm a' }}
                  </span>
                }
                @if (location(ev)) {
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ location(ev) }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ─── Content Area ─── -->
      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr,340px]">
        <!-- Main Content -->
        <div class="space-y-6">
          <!-- Description Card -->
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              {{ tr('عن الورشة', 'About this workshop') }}
            </h2>
            <p class="text-base leading-relaxed text-slate-700">
              {{ body(ev) }}
            </p>
          </div>

          <!-- Zoom CTA for enrolled users -->
          @if (isOwned() && zoomLink()) {
            <div class="relative overflow-hidden rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
              <div class="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 class="font-bold text-slate-900">{{ tr('جلسة الزوم جاهزة', 'Your Zoom session is ready') }}</h3>
                  <p class="text-sm text-slate-500 mt-1">{{ tr('انقر للانضمام إلى الجلسة المباشرة عبر زوم', 'Click to join the live session via Zoom') }}</p>
                </div>
                <a [href]="zoomLink()!" target="_blank" rel="noopener"
                   class="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] shrink-0">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  {{ tr('انضم عبر زوم', 'Join Zoom Session') }}
                </a>
              </div>
            </div>
          }
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Actions Card -->
          @if (isOwned()) {
            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
              <div class="flex items-center gap-2 text-emerald-600">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="text-sm font-bold">{{ tr('أنت مسجّل في هذه الورشة', 'You are enrolled in this workshop') }}</span>
              </div>

              @if (zoomLink()) {
                <a [href]="zoomLink()!" target="_blank" rel="noopener"
                   class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow transition-all active:scale-[0.98]">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  {{ tr('انضم عبر زوم', 'Join Zoom') }}
                </a>
              }

              <button type="button"
                      class="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      (click)="goBackToMyWorkshops()">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
                {{ tr('العودة إلى ورشي', 'Back to My Workshops') }}
              </button>
            </div>
          }

          @if (!isOwned()) {
            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">{{ i18n.t('detail.registration') }}</p>
              <p class="text-3xl font-extrabold text-brand-900">
                @if (ev.price <= 0) {
                  {{ i18n.t('card.free') }}
                } @else {
                  {{ ev.price | number: '1.2-3' }}
                  <span class="text-lg font-semibold text-slate-500">{{ priceSuffix() }}</span>
                }
              </p>
              <button
                type="button"
                class="mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-300 active:scale-[0.98]"
                [class.bg-emerald-600]="cart.lastAddedEventId() === ev.id"
                [class.motion-safe:animate-ve-added-pop]="cart.lastAddedEventId() === ev.id"
                [class.bg-brand-900]="cart.lastAddedEventId() !== ev.id"
                [class.hover:bg-brand-800]="cart.lastAddedEventId() !== ev.id"
                (click)="add(ev)"
              >
                @if (cart.lastAddedEventId() === ev.id) {
                  <svg class="h-4 w-4 motion-safe:animate-ve-added-check" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  {{ i18n.t('card.added') }}
                } @else {
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                  {{ i18n.t('detail.addCart') }}
                }
              </button>
            </div>
          }

          <!-- Details Card -->
          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">{{ tr('تفاصيل', 'Details') }}</h3>
            <div class="space-y-3">
              @if (ev.starts_at) {
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 shrink-0">
                    <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium">{{ tr('التاريخ', 'Date') }}</p>
                    <p class="text-sm font-semibold text-slate-900">{{ ev.starts_at | date: 'EEEE, MMM d, y' : undefined : dateLocale() }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-50 shrink-0">
                    <svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium">{{ tr('الوقت', 'Time') }}</p>
                    <p class="text-sm font-semibold text-slate-900">{{ ev.starts_at | date:'h:mm a' }}</p>
                  </div>
                </div>
              }
              @if (location(ev)) {
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 shrink-0">
                    <svg class="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium">{{ tr('الموقع', 'Location') }}</p>
                    <p class="text-sm font-semibold text-slate-900">{{ location(ev) }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      } @else {
        <div class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        </div>
      }
    }
  `,
})
export class EventDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsApi = inject(EventsService);
  private readonly learnApi = inject(LearnService);
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  readonly event = signal<HomeListEvent | null>(null);
  readonly myWorkshops = signal<EnrolledWorkshop[]>([]);
  readonly enrolledWorkshop = computed<EnrolledWorkshop | null>(() => {
    const ev = this.event();
    if (!ev) {
      return null;
    }
    return this.myWorkshops().find((w) => w.event.id === ev.id || w.event.slug === ev.slug) ?? null;
  });
  readonly error = signal<string | null>(null);
  readonly isOwned = computed(() => !!this.enrolledWorkshop());
  readonly zoomLink = computed(() => {
    const ws = this.enrolledWorkshop();
    if (!ws || ws.event.status === 'completed') {
      return null;
    }
    return ws.event.zoom_link ?? null;
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.learnApi
        .getMyWorkshops()
        .pipe(catchError(() => of({ data: [] as EnrolledWorkshop[] })))
        .subscribe((res) => this.myWorkshops.set(res.data));
    }

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set(this.i18n.t('detail.notFound'));
      return;
    }
    this.eventsApi.bySlug(slug).subscribe({
      next: (e) => this.event.set(volunteerToHome(e)),
      error: () => {
        const d = getDummyBySlug(slug);
        if (d) {
          this.event.set(d);
          this.error.set(null);
        } else {
          this.error.set(this.i18n.t('detail.notFound'));
        }
      },
    });
  }

  dateLocale(): string {
    return this.i18n.locale() === 'ar' ? 'ar-KW' : 'en-GB';
  }

  title(ev: VolunteerEvent): string {
    const h = ev as HomeListEvent;
    if (this.i18n.locale() === 'ar') {
      return h.titleAr ?? ev.title;
    }
    const en = ev.title_en?.trim();
    return en && en.length > 0 ? en : ev.title;
  }

  location(ev: VolunteerEvent): string | null {
    const h = ev as HomeListEvent;
    if (this.i18n.locale() === 'ar') {
      return h.locationAr ?? ev.location;
    }
    const en = ev.location_en?.trim();
    if (en && en.length > 0) {
      return en;
    }
    return ev.location;
  }

  body(ev: VolunteerEvent): string {
    const h = ev as HomeListEvent;
    if (this.i18n.locale() === 'ar') {
      return (
        this.cleanBodyText(ev.description) ??
        h.summaryAr ??
        ev.summary ??
        ''
      );
    }
    const enDesc = this.cleanBodyText(ev.description_en);
    if (enDesc) {
      return enDesc;
    }
    const enSummary = ev.summary_en?.trim() ?? '';
    if (enSummary && enSummary.length > 0) {
      return enSummary;
    }
    return ev.summary ?? this.cleanBodyText(ev.description) ?? '';
  }

  priceSuffix(): string {
    const ev = this.event();
    if (!ev) {
      return '';
    }
    const c = ev.currency?.toUpperCase();
    if (c === 'KWD') {
      return this.i18n.t('card.currencyKwd');
    }
    return ev.currency;
  }

  add(ev: HomeListEvent): void {
    if (ev.id < 0) {
      this.error.set(this.i18n.t('workshops.demoHint'));
      return;
    }
    this.cart.addItem(ev.id, 1).subscribe({
      next: () => {
        this.error.set(null);
        this.cart.openDrawer();
      },
      error: () => this.error.set(this.i18n.t('workshops.loadError')),
    });
  }

  goBackToMyWorkshops(): void {
    void this.router.navigate(['/dashboard']);
  }

  tr(ar: string, en: string): string {
    return this.i18n.isRtl() ? ar : en;
  }

  private cleanBodyText(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }
    const cleaned = value.trim();
    if (!cleaned) {
      return null;
    }
    if (/^facilitator:\s*.+·/i.test(cleaned) || /^مقدم الورشة:\s*.+·/.test(cleaned)) {
      return null;
    }
    return cleaned;
  }
}
