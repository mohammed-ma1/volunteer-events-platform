import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  KU_WORKSHOP_WEEK_DAY_KEYS,
  isKuWorkshopWeekDayKey,
  kuWorkshopWeekNoonIso,
} from '../../core/constants/ku-workshop-week';
import {
  WorkshopFilterCategory,
  inferCategory,
  eventMatchesWorkshopFilter,
} from '../../core/data/dummy-events';
import { I18nService } from '../../core/i18n/i18n.service';
import { TranslationKey } from '../../core/i18n/translations';
import { EnrolledWorkshop } from '../../core/models/learn.types';
import { LearnService } from '../../core/services/learn.service';
import { calendarDayKeyKuwait, formatDaySubLabelKuwait } from '../events/workshop-day-filters';

type StatusFilter = 'all' | 'upcoming' | 'ongoing' | 'completed';
type SortMode = 'closest' | 'latest' | 'title';

const CATEGORY_ORDER: WorkshopFilterCategory[] = [
  'all',
  'personal',
  'professional',
];

const ARABIC_DAY_ORDINALS = ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع'];
const ENGLISH_DAY_ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, NgClass, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- ─── Welcome Hero ─── -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 sm:p-8">
        <div class="absolute top-0 right-0 w-72 h-72 bg-brand-600/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {{ userInitial }}
            </div>
            <div>
              <span class="text-sm text-white/50">{{ tr('مرحباً بعودتك،', 'Welcome back,') }}</span>
              <h1 class="text-xl sm:text-2xl font-bold text-white">{{ userName }}</h1>
            </div>
          </div>
          <a routerLink="/" fragment="workshops"
             class="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur transition-colors self-start sm:self-auto">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {{ tr('تصفح المزيد من الورش', 'Browse More Workshops') }}
          </a>
        </div>
      </div>

      @if (loading()) {
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse">
          @for (_ of [1,2,3,4]; track _) {
            <div class="bg-white rounded-xl border border-slate-100 p-5 space-y-2"><div class="h-8 w-12 bg-slate-100 rounded-lg mx-auto"></div><div class="h-3 w-16 bg-slate-100 rounded mx-auto"></div></div>
          }
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          @for (_ of [1,2,3]; track _) {
            <div class="bg-white rounded-2xl border border-slate-100 p-0 overflow-hidden"><div class="h-36 bg-slate-100"></div><div class="p-4 space-y-2"><div class="h-4 w-3/4 bg-slate-100 rounded"></div><div class="h-3 w-1/2 bg-slate-100 rounded"></div></div></div>
          }
        </div>
      } @else if (workshops().length === 0) {
        <div class="text-center py-24 px-4">
          <div class="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 mb-6 shadow-sm">
            <svg class="h-14 w-14 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-2">{{ tr('لا توجد ورش بعد', 'No workshops yet') }}</h2>
          <span class="text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed block">{{
            tr(
              'اشترِ ورشة للبدء، وستظهر تلقائياً هنا في لوحة ورشي.',
              'Purchase a workshop to get started. Your workshops will appear here automatically.'
            )
          }}</span>
          <a routerLink="/" fragment="workshops"
             class="ve-btn-primary ve-btn-primary--lg active:scale-[0.98]">
            {{ tr('تصفح الورش', 'Browse Workshops') }}
          </a>
        </div>
      } @else {

        <!-- ─── Stats Row ─── -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <button type="button" (click)="onSelectStatus('all')"
                  class="relative bg-white rounded-xl border p-4 text-center group transition-all duration-200 hover:shadow-md"
                  [ngClass]="statusFilter() === 'all' ? 'border-brand-300 ring-2 ring-brand-100 shadow-md' : 'border-slate-100'">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-50 mb-2 mx-auto">
              <svg class="h-4.5 w-4.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
            </div>
            <div class="text-2xl font-extrabold text-brand-700">{{ workshops().length }}</div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5">{{ tr('الكل', 'Total') }}</div>
          </button>
          <button type="button" (click)="onSelectStatus('upcoming')"
                  class="relative bg-white rounded-xl border p-4 text-center group transition-all duration-200 hover:shadow-md"
                  [ngClass]="statusFilter() === 'upcoming' ? 'border-blue-300 ring-2 ring-blue-100 shadow-md' : 'border-slate-100'">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 mb-2 mx-auto">
              <svg class="h-4.5 w-4.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="text-2xl font-extrabold text-blue-600">{{ upcomingCount() }}</div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5">{{ tr('قادمة', 'Upcoming') }}</div>
          </button>
          <button type="button" (click)="onSelectStatus('ongoing')"
                  class="relative bg-white rounded-xl border p-4 text-center group transition-all duration-200 hover:shadow-md"
                  [ngClass]="statusFilter() === 'ongoing' ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-md' : 'border-slate-100'">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 mb-2 mx-auto">
              <svg class="h-4.5 w-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="text-2xl font-extrabold text-emerald-600">{{ ongoingCount() }}</div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5">{{ tr('مباشر الآن', 'Live Now') }}</div>
          </button>
          <button type="button" (click)="onSelectStatus('completed')"
                  class="relative bg-white rounded-xl border p-4 text-center group transition-all duration-200 hover:shadow-md"
                  [ngClass]="statusFilter() === 'completed' ? 'border-slate-300 ring-2 ring-slate-200 shadow-md' : 'border-slate-100'">
            <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 mb-2 mx-auto">
              <svg class="h-4.5 w-4.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="text-2xl font-extrabold text-slate-500">{{ completedCount() }}</div>
            <div class="text-[11px] text-slate-400 font-medium mt-0.5">{{ tr('مكتملة', 'Completed') }}</div>
          </button>
        </div>

        <!-- ─── Category filter (with counts) ─── -->
        <div class="flex flex-col gap-2.5">
          <div class="flex">
            <span class="text-xs font-semibold text-slate-500">{{ tr('تصفح الورشات حسب التصنيف', 'Browse workshops by category') }}</span>
          </div>
          <div class="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            @for (cat of CATEGORY_ORDER; track cat) {
              <button type="button" (click)="onSelectCategory(cat)"
                      class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98]"
                      [ngClass]="selectedCategory() === cat
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'">
                {{ categoryLabel(cat) }} <span class="font-normal opacity-75">({{ categoryCount(cat) }})</span>
              </button>
            }
          </div>
        </div>

        <!-- ─── Day filter (with date sublabels) ─── -->
        @if (dayBuckets().length > 0) {
          <div class="flex flex-col gap-2.5">
            <div class="flex">
              <span class="text-xs font-semibold text-slate-500">{{ tr('تصفح الورشات حسب أيام عرضها', 'Browse workshops by day') }}</span>
            </div>
            <div class="flex flex-wrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <!-- All days -->
              <button type="button"
                      (click)="onSelectDay(null)"
                      class="shrink-0 rounded-2xl px-4 py-2 text-center transition duration-200"
                      [ngClass]="selectedDayKey() === null
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'">
                <span class="block text-sm font-bold">{{ tr('كل الأيام', 'All days') }}</span>
                <span class="mt-0.5 block text-[11px] font-medium"
                      [ngClass]="selectedDayKey() === null ? 'text-white/80' : 'text-slate-400'">{{ tr('عرض الكل', 'Show all') }}</span>
              </button>
              @for (b of dayBuckets(); track b.key; let di = $index) {
                <button type="button"
                        (click)="onSelectDay(b.key)"
                        class="shrink-0 rounded-2xl px-4 py-2 text-center transition duration-200"
                        [ngClass]="selectedDayKey() === b.key
                          ? 'bg-brand-900 text-white shadow-md'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'">
                  <span class="block text-sm font-bold">{{ dayLabel(di) }}</span>
                  <span class="mt-0.5 block text-[11px] font-medium"
                        [ngClass]="selectedDayKey() === b.key ? 'text-white/80' : 'text-slate-400'">{{ b.sub }}</span>
                </button>
              }
            </div>
          </div>
        }

        <!-- ─── My workshops header + search + sort ─── -->
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 sm:order-1">
            <h2 class="text-lg font-bold text-slate-900">{{ tr('ورشـي', 'My Workshops') }}</h2>
            <span class="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">{{ filteredWorkshops().length }} {{ tr('ورشة', 'workshops') }}</span>
          </div>
          <div class="flex items-center gap-2 sm:order-2 sm:flex-1 sm:max-w-md">
            <label class="flex flex-1 items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-brand-900/25 focus-within:ring-2 focus-within:ring-brand-900/10">
              <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input
                class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                [placeholder]="tr('ابحث...', 'Search...')"
                [ngModel]="searchText()"
                (ngModelChange)="searchText.set($event)"
              />
            </label>
            <div class="relative">
              <select
                [ngModel]="sortMode()"
                (ngModelChange)="sortMode.set($event)"
                class="appearance-none rounded-full border border-slate-200 bg-white ps-4 pe-9 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10"
              >
                <option value="closest">{{ tr('الأقرب', 'Closest') }}</option>
                <option value="latest">{{ tr('الأحدث', 'Latest') }}</option>
                <option value="title">{{ tr('أبجدي', 'Alphabetical') }}</option>
              </select>
              <svg class="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Status chips (mobile-friendly alt to the stat cards) -->
        <div class="flex gap-2 overflow-x-auto pb-1 sm:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (s of STATUS_FILTERS; track s) {
            <button type="button" (click)="onSelectStatus(s)"
                    class="shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition"
                    [ngClass]="statusFilter() === s
                      ? 'bg-brand-900 text-white shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'">
              {{ statusLabel(s) }}
            </button>
          }
        </div>

        <!-- ─── Workshop Cards Grid ─── -->
        <div>
          @if (filteredWorkshops().length === 0) {
            <div class="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <svg class="h-10 w-10 text-slate-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <p class="text-sm text-slate-400">{{ tr('لا توجد ورش تطابق بحثك', 'No workshops match your filters') }}</p>
              <button type="button" class="mt-3 text-sm text-brand-600 font-semibold hover:underline" (click)="clearFilters()">
                {{ tr('مسح الفلاتر', 'Clear filters') }}
              </button>
            </div>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (ws of filteredWorkshops(); track ws.id) {
              <div class="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg cursor-pointer"
                   [ngClass]="ws.event.status === 'ongoing' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-100'"
                   role="button" tabindex="0"
                   (click)="openWorkshop(ws)"
                   (keydown.enter)="openWorkshop(ws)"
                   (keydown.space)="openWorkshop(ws); $event.preventDefault()">

                <!-- Image -->
                <div class="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  @if (ws.event.image_url) {
                    <img [src]="ws.event.image_url" [alt]="workshopTitle(ws)" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-100">
                      <svg class="h-10 w-10 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </div>
                  }
                  <!-- Status Badge -->
                  <div class="absolute top-3 start-3">
                    @if (ws.event.status === 'ongoing') {
                      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shadow bg-emerald-600 text-white">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {{ tr('مباشر', 'LIVE') }}
                      </span>
                    } @else if (ws.event.status === 'upcoming') {
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-blue-600 text-white">{{ tr('قادمة', 'UPCOMING') }}</span>
                    } @else {
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shadow bg-slate-500 text-white">{{ tr('مكتملة', 'ENDED') }}</span>
                    }
                  </div>
                </div>

                <!-- Content -->
                <div class="flex flex-1 flex-col p-4 gap-1.5">
                  <h3 class="font-bold text-slate-900 text-base line-clamp-2 leading-snug">{{ workshopTitle(ws) }}</h3>

                  @if (presenterName(ws); as host) {
                    <p class="inline-flex items-center gap-1.5 text-xs text-brand-700 font-semibold">
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                      {{ host }}
                    </p>
                  }

                  @if (workshopSummary(ws); as sum) {
                    <p class="text-xs text-slate-400 line-clamp-2">{{ sum }}</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private learnService = inject(LearnService);
  private router = inject(Router);

  readonly STATUS_FILTERS: StatusFilter[] = ['all', 'upcoming', 'ongoing', 'completed'];
  readonly CATEGORY_ORDER = CATEGORY_ORDER;

  workshops = signal<EnrolledWorkshop[]>([]);
  loading = signal(true);
  /** Search box text. Must be a signal so `filteredWorkshops` re-runs on every keystroke. */
  readonly searchText = signal('');
  /** Sort mode for the workshop list. Signal so the computed re-runs when the user picks a new option. */
  readonly sortMode = signal<SortMode>('closest');
  readonly statusFilter = signal<StatusFilter>('all');
  readonly selectedDayKey = signal<string | null>(null);
  readonly selectedCategory = signal<WorkshopFilterCategory>('all');

  upcomingCount = signal(0);
  ongoingCount = signal(0);
  completedCount = signal(0);

  readonly dayBuckets = computed(() => {
    const list = this.workshops();
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    const touchesKuWeek = list.some(
      (w) => w.event.starts_at && isKuWorkshopWeekDayKey(calendarDayKeyKuwait(w.event.starts_at)),
    );
    if (touchesKuWeek) {
      return KU_WORKSHOP_WEEK_DAY_KEYS.map((key) => ({
        key,
        sub: formatDaySubLabelKuwait(kuWorkshopWeekNoonIso(key), loc as 'ar' | 'en'),
      }));
    }
    const seen = new Map<string, string>();
    for (const w of list) {
      if (!w.event.starts_at) continue;
      const k = calendarDayKeyKuwait(w.event.starts_at);
      if (!seen.has(k)) {
        seen.set(k, formatDaySubLabelKuwait(w.event.starts_at, loc as 'ar' | 'en'));
      }
    }
    return Array.from(seen, ([key, sub]) => ({ key, sub }));
  });

  readonly filteredWorkshops = computed(() => {
    let list = this.workshops();

    const status = this.statusFilter();
    if (status !== 'all') {
      list = list.filter((w) => w.event.status === status);
    }

    const dk = this.selectedDayKey();
    if (dk) {
      list = list.filter((w) => w.event.starts_at && calendarDayKeyKuwait(w.event.starts_at) === dk);
    }

    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter((w) => eventMatchesWorkshopFilter(cat, inferCategory(w.event)));
    }

    const q = this.searchText().trim().toLowerCase();
    if (q) {
      list = list.filter((w) => {
        const title = (w.event.title + ' ' + (w.event.title_en ?? '')).toLowerCase();
        const summary = ((w.event.summary ?? '') + ' ' + (w.event.summary_en ?? '')).toLowerCase();
        const host = (w.event.host_name ?? '').toLowerCase();
        return title.includes(q) || summary.includes(q) || host.includes(q);
      });
    }

    return this.applySort(list, this.sortMode());
  });

  private applySort(list: EnrolledWorkshop[], mode: SortMode): EnrolledWorkshop[] {
    const t = (s?: string) => (s ?? '').trim();
    const time = (s?: string) => (s ? new Date(s).getTime() : Number.POSITIVE_INFINITY);
    const sorted = [...list];
    switch (mode) {
      case 'closest':
        sorted.sort((a, b) => time(a.event.starts_at) - time(b.event.starts_at));
        break;
      case 'latest':
        sorted.sort((a, b) => time(b.event.starts_at) - time(a.event.starts_at));
        break;
      case 'title':
        sorted.sort((a, b) => t(this.workshopTitle(a)).localeCompare(t(this.workshopTitle(b))));
        break;
    }
    return sorted;
  }

  get userName(): string {
    return this.auth.user()?.name ?? 'Learner';
  }

  get userInitial(): string {
    return (this.auth.user()?.name ?? 'L').charAt(0).toUpperCase();
  }

  ngOnInit(): void {
    this.learnService.getMyWorkshops().subscribe({
      next: ({ data }) => {
        this.workshops.set(data);
        this.upcomingCount.set(data.filter(w => w.event.status === 'upcoming').length);
        this.ongoingCount.set(data.filter(w => w.event.status === 'ongoing').length);
        this.completedCount.set(data.filter(w => w.event.status === 'completed').length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onSelectStatus(s: StatusFilter): void {
    this.statusFilter.set(this.statusFilter() === s ? 'all' : s);
  }

  onSelectDay(dayKey: string | null): void {
    if (dayKey === null) {
      this.selectedDayKey.set(null);
      return;
    }
    this.selectedDayKey.set(this.selectedDayKey() === dayKey ? null : dayKey);
  }

  onSelectCategory(cat: WorkshopFilterCategory): void {
    this.selectedCategory.set(this.selectedCategory() === cat ? 'all' : cat);
  }

  categoryLabel(cat: WorkshopFilterCategory): string {
    return this.i18n.t(`cat.${cat}` as TranslationKey);
  }

  /** Number of enrolled workshops in this category (always shown next to chip). */
  categoryCount(cat: WorkshopFilterCategory): number {
    const list = this.workshops();
    if (cat === 'all') {
      return list.length;
    }
    return list.filter((w) => eventMatchesWorkshopFilter(cat, inferCategory(w.event))).length;
  }

  /** Localised ordinal day label: "اليوم الأول" / "Day First". */
  dayLabel(dayIndex: number): string {
    const ordinals = this.isArabic() ? ARABIC_DAY_ORDINALS : ENGLISH_DAY_ORDINALS;
    const ord = ordinals[dayIndex] ?? String(dayIndex + 1);
    return this.isArabic() ? `اليوم ${ord}` : `Day ${ord}`;
  }

  /** Trim and return the host name when present. */
  presenterName(ws: EnrolledWorkshop): string | null {
    const raw = ws.event.host_name?.trim();
    return raw && raw.length > 0 ? raw : null;
  }

  clearFilters(): void {
    this.searchText.set('');
    this.statusFilter.set('all');
    this.selectedDayKey.set(null);
    this.selectedCategory.set('all');
  }

  statusLabel(s: StatusFilter): string {
    switch (s) {
      case 'all':
        return this.tr('الكل', 'All');
      case 'upcoming':
        return this.tr('قادمة', 'Upcoming');
      case 'ongoing':
        return this.tr('مباشر', 'Live');
      case 'completed':
        return this.tr('مكتملة', 'Completed');
    }
  }

  openWorkshop(ws: EnrolledWorkshop): void {
    void this.router.navigate(['/events', ws.event.slug]);
  }

  workshopTitle(ws: EnrolledWorkshop): string {
    if (this.isArabic()) {
      return ws.event.title;
    }
    return ws.event.title_en?.trim() || ws.event.title;
  }

  workshopSummary(ws: EnrolledWorkshop): string | null {
    if (this.isArabic()) {
      return (
        ws.event.description?.trim() ||
        ws.event.summary ||
        ws.event.summary_en ||
        null
      );
    }
    const descEn = ws.event.description_en?.trim();
    if (descEn) {
      return descEn;
    }
    const summaryEn = ws.event.summary_en?.trim();
    return summaryEn || ws.event.summary || null;
  }

  workshopLocation(ws: EnrolledWorkshop): string | null {
    if (this.isArabic()) {
      return ws.event.location ?? ws.event.location_en ?? null;
    }
    const locationEn = ws.event.location_en?.trim();
    return locationEn || ws.event.location || null;
  }

  tr(ar: string, en: string): string {
    return this.isArabic() ? ar : en;
  }

  private isArabic(): boolean {
    return this.i18n.locale() === 'ar';
  }
}
