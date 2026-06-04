import { DOCUMENT, NgClass } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal, computed } from '@angular/core';
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
import { BitaStatus, LearnService } from '../../core/services/learn.service';
import {
  calendarDayKeyKuwait,
  formatDaySubLabelKuwait,
} from '../events/workshop-day-filters';
import { formatCardDateLong, formatStartsInCompact, formatTimeKuwait } from '../events/event-card-meta';
import { getPresenterInitialsFromHostName } from '../../core/data/home-experts';

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
          <button
            type="button"
            (click)="scrollToWorkshopSearch()"
            class="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20 active:scale-[0.98] motion-reduce:active:scale-100 sm:self-auto"
          >
            <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            {{ tr('تصفح المزيد من الورش', 'Browse More Workshops') }}
          </button>
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
        <div [ngClass]="bitaStatus()?.eligible_purchase
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4'
                : 'grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4'">
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

          @if (bitaStatus(); as bs) {
            @if (bs.eligible_purchase) {
              <button
                type="button"
                (click)="onBitaTileClick()"
                [disabled]="bitaRequesting()"
                class="relative overflow-hidden rounded-xl border p-4 text-center group transition-all duration-200 hover:shadow-md disabled:cursor-progress motion-safe:animate-ve-fade-up"
                [ngClass]="bs.requested_at
                  ? 'border-emerald-200 bg-emerald-50/70'
                  : 'border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/60 hover:border-amber-300'"
              >
                <!-- Subtle sparkles in the background for the "premium" feel -->
                <span aria-hidden="true" class="pointer-events-none absolute inset-0 motion-safe:animate-pulse opacity-40">
                  <span class="absolute top-2 right-3 h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  <span class="absolute bottom-3 left-3 h-1 w-1 rounded-full bg-amber-300"></span>
                  <span class="absolute top-4 left-6 h-1 w-1 rounded-full bg-emerald-300"></span>
                </span>

                <!-- Official BITA badge -->
                <div class="relative mx-auto mb-2 flex h-10 w-10 items-center justify-center">
                  <img src="/images/branding/bita-logo.png" alt="BITA" class="h-10 w-10 object-contain drop-shadow-sm" />
                  @if (bs.requested_at) {
                    <span class="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
                      <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                      </svg>
                    </span>
                  }
                </div>

                <div class="relative">
                  <div
                    class="text-sm font-extrabold leading-tight"
                    [ngClass]="bs.requested_at ? 'text-emerald-700' : 'text-amber-700'"
                  >
                    {{ i18n.t('bitaCert.tileTitle') }}
                  </div>
                  <div
                    class="mt-0.5 text-[11px] font-medium"
                    [ngClass]="bs.requested_at ? 'text-emerald-600' : 'text-amber-600'"
                  >
                    {{ bs.requested_at ? i18n.t('bitaCert.tileSubtitleRequested') : i18n.t('bitaCert.tileSubtitleRequest') }}
                  </div>
                  @if (!bs.requested_at) {
                    <div class="mt-1 inline-flex items-center gap-1 text-[10px] font-bold tabular-nums text-amber-700/80">
                      <span>{{ bs.completed_count }}</span>
                      <span class="opacity-50">/</span>
                      <span>{{ bs.required_count }}</span>
                    </div>
                  }
                </div>
              </button>
            }
          }
        </div>

        @if (bitaErrorToast(); as toast) {
          <div role="status" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 motion-safe:animate-ve-fade-up">
            {{ toast }}
          </div>
        }

        <!-- ─── My workshops header ─── -->
        <div id="dashboard-workshop-search" class="scroll-mt-28 flex min-w-0 items-center gap-2">
          <h2 class="truncate text-base font-bold text-slate-900 sm:text-lg">{{ tr('ورشـي', 'My Workshops') }}</h2>
          <span class="whitespace-nowrap rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700 sm:px-2.5 sm:py-1 sm:text-xs">{{ filteredWorkshops().length }} {{ tr('ورشة', 'workshops') }}</span>
        </div>

        <!-- ─── Search + filter dropdowns (category / day / sort) ─── -->
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
          <!-- Search -->
          <label class="flex min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-brand-900/25 focus-within:ring-2 focus-within:ring-brand-900/10 sm:flex-1 sm:gap-2.5 sm:px-4 sm:py-2.5">
            <svg class="h-4 w-4 shrink-0 text-slate-400 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              class="min-w-0 flex-1 bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400 sm:text-sm"
              [placeholder]="tr('ابحث عن ورشة، مدرب، أو موضوع...', 'Search workshops, trainers...')"
              [ngModel]="searchText()"
              (ngModelChange)="onSearchTextChange($event)"
            />
          </label>

          <!-- Filter dropdowns -->
          <div class="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible sm:pb-0">
            <!-- Category -->
            <div class="relative shrink-0">
              <svg class="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-.553.894l-4 2A1 1 0 019 21v-8.586L3.293 6.707A1 1 0 013 6V4z"/></svg>
              <select
                [ngModel]="selectedCategory()"
                (ngModelChange)="onCategoryDropdownChange($event)"
                [attr.aria-label]="tr('تصفية حسب التصنيف', 'Filter by category')"
                class="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-2 ps-9 pe-8 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10 sm:py-2.5 sm:text-sm"
              >
                @for (cat of CATEGORY_ORDER; track cat) {
                  <option [value]="cat">{{ categoryLabel(cat) }} ({{ categoryCount(cat) }})</option>
                }
              </select>
              <svg class="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>

            <!-- Day -->
            @if (dayBuckets().length > 0) {
              <div class="relative shrink-0">
                <svg class="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                <select
                  [ngModel]="selectedDayKey() ?? ''"
                  (ngModelChange)="onDayDropdownChange($event)"
                  [attr.aria-label]="tr('تصفية حسب اليوم', 'Filter by day')"
                  class="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-2 ps-9 pe-8 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10 sm:py-2.5 sm:text-sm"
                >
                  <option value="">{{ tr('كل الأيام', 'All days') }} ({{ workshopsBeforeDayFilter().length }})</option>
                  @for (b of dayBuckets(); track b.key; let di = $index) {
                    <option [value]="b.key">{{ dayLabelWithCount(di, b.count) }} — {{ b.sub }}</option>
                  }
                </select>
                <svg class="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
              </div>
            }

            <!-- Sort -->
            <div class="relative shrink-0">
              <svg class="pointer-events-none absolute start-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7h13M3 12h9M3 17h5M17 7v10m0 0l-3-3m3 3l3-3"/></svg>
              <select
                [ngModel]="sortMode()"
                (ngModelChange)="onSortModeChange($event)"
                [attr.aria-label]="tr('ترتيب', 'Sort')"
                class="cursor-pointer appearance-none rounded-full border border-slate-200 bg-white py-2 ps-9 pe-8 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-brand-900/10 sm:py-2.5 sm:text-sm"
              >
                <option value="closest">{{ tr('الأقرب', 'Closest') }}</option>
                <option value="latest">{{ tr('الأحدث', 'Latest') }}</option>
                <option value="title">{{ tr('أبجدي', 'Alphabetical') }}</option>
              </select>
              <svg class="pointer-events-none absolute end-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>
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
          } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (ws of displayedWorkshops(); track ws.id) {
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
                <div class="flex flex-1 flex-col gap-2 p-4">
                  <h3 class="line-clamp-2 text-base font-bold leading-snug text-slate-900">{{ workshopTitle(ws) }}</h3>

                  @if (presenterName(ws); as host) {
                    <div class="flex min-w-0 items-center gap-2">
                      <span
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-800 to-brand-900 text-[11px] font-bold text-white shadow-sm"
                        dir="ltr"
                        aria-hidden="true"
                        >{{ presenterInitials(ws) }}</span>
                      <span class="min-w-0 truncate text-xs font-semibold text-brand-700">{{ host }}</span>
                    </div>
                  }

                  @if (ws.event.starts_at) {
                    <div class="flex flex-col gap-1 text-xs text-slate-600">
                      <div class="flex min-w-0 items-center gap-2">
                        <svg class="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span class="min-w-0 truncate">{{ workshopDateLong(ws) }}</span>
                      </div>
                      <div class="flex min-w-0 items-center gap-2">
                        <svg class="h-3.5 w-3.5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span class="min-w-0 truncate">{{ workshopTimeKuwait(ws) }}</span>
                      </div>
                    </div>
                  }

                  @if (workshopSummary(ws); as sum) {
                    <p class="line-clamp-2 min-h-0 flex-1 text-xs text-slate-400">{{ sum }}</p>
                  }

                  <div class="mt-auto flex w-full flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    @if (startsInLabel(ws); as rel) {
                      <span
                        class="inline-flex max-w-[min(100%,11rem)] shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold leading-tight text-sky-900 ring-1 ring-sky-100"
                        >{{ rel }}</span>
                    } @else {
                      <span class="min-w-0 flex-1"></span>
                    }
                    <a
                      [routerLink]="['/events', ws.event.slug]"
                      (click)="$event.stopPropagation()"
                      class="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-brand-700 transition hover:text-brand-900 hover:underline"
                    >
                      {{ tr('التفاصيل', 'Details') }}
                      <svg
                        class="h-3.5 w-3.5 shrink-0 rtl:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            }
          </div>

          @if (canLoadMoreWorkshops() || canLoadLessWorkshops()) {
            <div class="mt-6 flex flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              @if (canLoadMoreWorkshops()) {
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] motion-reduce:active:scale-100 sm:px-6"
                  (click)="loadMoreWorkshops()"
                >
                  {{ i18n.t('workshops.showMore') }}
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              }
              @if (canLoadLessWorkshops()) {
                <button
                  type="button"
                  class="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-brand-900 shadow-sm transition hover:bg-slate-50 active:scale-[0.98] motion-reduce:active:scale-100 sm:px-6"
                  (click)="loadLessWorkshops()"
                >
                  {{ i18n.t('workshops.showLess') }}
                  <svg class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              }
            </div>
          }
          }
        </div>
      }

      <!-- ───────────── BITA: "Almost there!" locked-state modal ───────────── -->
      @if (showBitaLockedModal()) {
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="i18n.t('bitaCert.modalLockedTitle')"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 motion-safe:animate-ve-fade-in"
        >
          <!-- Backdrop -->
          <button
            type="button"
            (click)="closeBitaLockedModal()"
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            [attr.aria-label]="i18n.t('bitaCert.modalCloseAria')"
          ></button>

          <!-- Card -->
          <div
            class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 motion-safe:animate-ve-fade-up"
            [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
            [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
          >
            <!-- Amber glow header with sparkle particles -->
            <div class="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 px-6 pt-8 pb-6 text-center">
              <span aria-hidden="true" class="pointer-events-none absolute inset-0">
                <span class="absolute top-3 left-6 h-1.5 w-1.5 rounded-full bg-amber-300 motion-safe:animate-ping"></span>
                <span class="absolute top-8 right-8 h-1 w-1 rounded-full bg-orange-400 motion-safe:animate-pulse" style="animation-delay: 600ms"></span>
                <span class="absolute bottom-4 left-1/3 h-1 w-1 rounded-full bg-amber-400 motion-safe:animate-pulse" style="animation-delay: 1.2s"></span>
                <span class="absolute bottom-8 right-1/4 h-1.5 w-1.5 rounded-full bg-amber-200 motion-safe:animate-ping" style="animation-delay: 900ms"></span>
              </span>

              <!-- Progress ring + lock icon centre -->
              <div class="relative mx-auto h-32 w-32">
                <svg class="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" stroke="#fde68a" stroke-width="10" fill="none" />
                  <circle
                    cx="60" cy="60" r="52"
                    stroke="url(#bita-ring-grad)" stroke-width="10" stroke-linecap="round" fill="none"
                    [attr.stroke-dasharray]="326.7"
                    [attr.stroke-dashoffset]="326.7 - (326.7 * bitaProgressPct() / 100)"
                    style="transition: stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)"
                  />
                  <defs>
                    <linearGradient id="bita-ring-grad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stop-color="#f59e0b"/>
                      <stop offset="100%" stop-color="#b45309"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <div class="motion-safe:animate-ve-float text-amber-600">
                    <svg class="h-9 w-9" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"/>
                    </svg>
                  </div>
                  <div class="mt-0.5 text-xs font-bold text-amber-700 tabular-nums">{{ bitaProgressPct() }}%</div>
                </div>
              </div>

              <h3 class="mt-5 text-xl font-extrabold text-slate-900">{{ i18n.t('bitaCert.modalLockedTitle') }}</h3>
            </div>

            <!-- Body -->
            <div class="px-6 pt-5 pb-6 text-center">
              <p class="text-sm leading-relaxed text-slate-600">{{ i18n.t('bitaCert.modalLockedBody') }}</p>

              <!-- Numeric progress + bar -->
              <div class="mt-5 rounded-xl bg-slate-50 px-4 py-3.5 ring-1 ring-slate-100">
                <div class="flex items-baseline justify-center gap-1.5 text-slate-700">
                  <span class="text-2xl font-black tabular-nums text-amber-700">{{ bitaStatus()?.completed_count ?? 0 }}</span>
                  <span class="text-sm font-semibold opacity-60">/</span>
                  <span class="text-base font-bold tabular-nums opacity-70">{{ bitaStatus()?.required_count ?? 100 }}</span>
                  <span class="ms-1 text-xs font-medium text-slate-500">{{ i18n.t('bitaCert.modalProgressLabel') }}</span>
                </div>
                <div class="mt-2 h-2 w-full overflow-hidden rounded-full bg-amber-100">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
                    [style.width.%]="bitaProgressPct()"
                    style="transition: width 600ms ease-out;"
                  ></div>
                </div>
              </div>

              <p class="mt-4 text-[11px] font-medium italic text-slate-400">{{ i18n.t('bitaCert.modalLockedHint') }}</p>

              <button
                type="button"
                (click)="closeBitaLockedModal()"
                class="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-[0.98]"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
                {{ i18n.t('bitaCert.modalContinueCta') }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- ───────────── BITA: success modal after a successful POST ───────────── -->
      @if (showBitaSuccessModal()) {
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="i18n.t('bitaCert.modalSuccessTitle')"
          class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 motion-safe:animate-ve-fade-in"
        >
          <button
            type="button"
            (click)="closeBitaSuccessModal()"
            class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            [attr.aria-label]="i18n.t('bitaCert.modalCloseAria')"
          ></button>

          <div
            class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 motion-safe:animate-ve-fade-up"
            [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
            [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
          >
            <div class="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-emerald-50 px-6 pt-8 pb-6 text-center">
              <span aria-hidden="true" class="pointer-events-none absolute inset-0">
                <span class="absolute top-4 left-8 h-1.5 w-1.5 rounded-full bg-emerald-300 motion-safe:animate-ping"></span>
                <span class="absolute top-10 right-10 h-1 w-1 rounded-full bg-emerald-400 motion-safe:animate-pulse" style="animation-delay: 400ms"></span>
                <span class="absolute bottom-6 right-1/3 h-1 w-1 rounded-full bg-emerald-300 motion-safe:animate-pulse" style="animation-delay: 1s"></span>
              </span>
              <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50 motion-safe:animate-ve-success-pop">
                <svg class="h-10 w-10 text-emerald-600 motion-safe:animate-ve-success-check" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <h3 class="mt-5 text-xl font-extrabold text-slate-900">{{ i18n.t('bitaCert.modalSuccessTitle') }}</h3>
            </div>
            <div class="px-6 pt-2 pb-6 text-center">
              <p class="text-sm leading-relaxed text-slate-600">{{ i18n.t('bitaCert.modalSuccessBody') }}</p>
              <button
                type="button"
                (click)="closeBitaSuccessModal()"
                class="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                {{ i18n.t('bitaCert.modalSuccessCta') }}
              </button>
            </div>
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
  private document = inject(DOCUMENT);

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

  // ── BITA paper-certificate request ──────────────────────────────────────
  /** Eligibility + progress from GET /v1/learn/bita-status. Null until the call resolves. */
  readonly bitaStatus = signal<BitaStatus | null>(null);
  /** True while the POST /v1/learn/bita-request is in-flight. */
  readonly bitaRequesting = signal(false);
  /** Drives the "Almost there!" locked modal. */
  readonly showBitaLockedModal = signal(false);
  /** Drives the post-request success modal. */
  readonly showBitaSuccessModal = signal(false);
  /** Toast surface for transient request errors. */
  readonly bitaErrorToast = signal<string | null>(null);

  /** Workshops matching status + category (same basis as day chips and counts). */
  readonly workshopsBeforeDayFilter = computed(() => {
    let list = this.workshops();
    if (this.statusFilter() !== 'all') {
      list = list.filter((w) => w.event.status === this.statusFilter());
    }
    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter((w) => eventMatchesWorkshopFilter(cat, inferCategory(w.event)));
    }
    return list;
  });

  readonly dayBuckets = computed(() => {
    const list = this.workshopsBeforeDayFilter();
    const loc = this.i18n.locale() === 'ar' ? 'ar' : 'en';
    const countByKey = new Map<string, number>();
    for (const w of list) {
      if (!w.event.starts_at) continue;
      const k = calendarDayKeyKuwait(w.event.starts_at);
      countByKey.set(k, (countByKey.get(k) ?? 0) + 1);
    }
    const touchesKuWeek = list.some(
      (w) => w.event.starts_at && isKuWorkshopWeekDayKey(calendarDayKeyKuwait(w.event.starts_at)),
    );
    if (touchesKuWeek) {
      return KU_WORKSHOP_WEEK_DAY_KEYS.map((key) => ({
        key,
        sub: formatDaySubLabelKuwait(kuWorkshopWeekNoonIso(key), loc as 'ar' | 'en'),
        count: countByKey.get(key) ?? 0,
      }));
    }
    const byKey = new Map<string, { key: string; sub: string; count: number; sort: number }>();
    for (const w of list) {
      if (!w.event.starts_at) continue;
      const k = calendarDayKeyKuwait(w.event.starts_at);
      const t = new Date(w.event.starts_at).getTime();
      const prev = byKey.get(k);
      const cnt = countByKey.get(k) ?? 0;
      if (!prev || t < prev.sort) {
        byKey.set(k, {
          key: k,
          sort: t,
          sub: formatDaySubLabelKuwait(w.event.starts_at, loc as 'ar' | 'en'),
          count: cnt,
        });
      }
    }
    return [...byKey.values()].sort((a, b) => a.sort - b.sort);
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

  /** Matches Tailwind `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` for “N rows” paging. */
  readonly gridColumns = signal<1 | 2 | 3>(3);
  /** Number of grid rows to show; item cap = `gridColumns() * visibleGridRows()`. */
  readonly visibleGridRows = signal(3);

  readonly displayedWorkshops = computed(() => {
    const list = this.filteredWorkshops();
    const cap = this.gridColumns() * this.visibleGridRows();
    return list.slice(0, Math.min(list.length, cap));
  });

  readonly canLoadMoreWorkshops = computed(() => {
    const cap = this.gridColumns() * this.visibleGridRows();
    return this.filteredWorkshops().length > cap;
  });

  readonly canLoadLessWorkshops = computed(() => this.visibleGridRows() > 3);

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
    this.refreshGridColumnsFromWidth();
    this.learnService.getMyWorkshops().subscribe({
      next: ({ data }) => {
        this.workshops.set(data);
        this.upcomingCount.set(data.filter(w => w.event.status === 'upcoming').length);
        this.ongoingCount.set(data.filter(w => w.event.status === 'ongoing').length);
        this.completedCount.set(data.filter(w => w.event.status === 'completed').length);
        this.loading.set(false);
        this.resetWorkshopPaging();
      },
      error: () => this.loading.set(false),
    });
    // BITA status is independent of the workshop list — fetch in parallel and
    // ignore failures (the tile simply stays hidden if the call errors).
    this.learnService.getBitaStatus().subscribe({
      next: ({ data }) => this.bitaStatus.set(data),
      error: () => this.bitaStatus.set(null),
    });
  }

  /** Click handler for the dashboard "Request BITA Cert" tile. */
  onBitaTileClick(): void {
    const s = this.bitaStatus();
    if (!s || !s.eligible_purchase) {
      return;
    }
    if (s.requested_at) {
      // Already requested — show the success modal again as a friendly recap.
      this.showBitaSuccessModal.set(true);
      return;
    }
    if (!s.can_request) {
      this.showBitaLockedModal.set(true);
      return;
    }
    this.submitBitaRequest();
  }

  closeBitaLockedModal(): void {
    this.showBitaLockedModal.set(false);
  }

  closeBitaSuccessModal(): void {
    this.showBitaSuccessModal.set(false);
  }

  /** POSTs to /v1/learn/bita-request, then flips to success modal + refreshes status. */
  private submitBitaRequest(): void {
    if (this.bitaRequesting()) return;
    this.bitaRequesting.set(true);
    this.bitaErrorToast.set(null);
    this.learnService.requestBitaCertificate().subscribe({
      next: () => {
        // Refresh BITA status so the tile flips to its "Requested" state.
        this.learnService.getBitaStatus().subscribe({
          next: ({ data }) => this.bitaStatus.set(data),
          error: () => undefined,
        });
        this.bitaRequesting.set(false);
        this.showBitaSuccessModal.set(true);
      },
      error: () => {
        this.bitaRequesting.set(false);
        this.bitaErrorToast.set(this.i18n.t('bitaCert.requestErrorToast'));
        window.setTimeout(() => this.bitaErrorToast.set(null), 4000);
      },
    });
  }

  /**
   * BITA progress percentage for the locked-modal progress ring,
   * clamped to [0, 100].
   */
  bitaProgressPct(): number {
    const s = this.bitaStatus();
    if (!s || s.required_count <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((s.completed_count / s.required_count) * 100)));
  }

  /** Hero CTA: smooth-scroll to the “My workshops” search row (when workshops are loaded). */
  scrollToWorkshopSearch(): void {
    if (this.loading() || this.workshops().length === 0) {
      return;
    }
    const root = this.document.getElementById('dashboard-workshop-search');
    if (!root) {
      return;
    }
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const input = root.querySelector('input');
      if (input instanceof HTMLInputElement) {
        input.focus({ preventScroll: true });
      }
    }, 400);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.refreshGridColumnsFromWidth();
  }

  private refreshGridColumnsFromWidth(): void {
    if (typeof window === 'undefined') {
      return;
    }
    const w = window.innerWidth;
    if (w >= 1024) {
      this.gridColumns.set(3);
    } else if (w >= 640) {
      this.gridColumns.set(2);
    } else {
      this.gridColumns.set(1);
    }
  }

  private resetWorkshopPaging(): void {
    this.visibleGridRows.set(3);
  }

  loadMoreWorkshops(): void {
    this.visibleGridRows.update((r) => r + 2);
  }

  loadLessWorkshops(): void {
    this.visibleGridRows.update((r) => Math.max(3, r - 2));
  }

  onSortModeChange(value: string): void {
    if (value === 'closest' || value === 'latest' || value === 'title') {
      this.sortMode.set(value);
      this.resetWorkshopPaging();
    }
  }

  onSearchTextChange(value: string): void {
    this.searchText.set(value);
    this.resetWorkshopPaging();
  }

  onSelectStatus(s: StatusFilter): void {
    this.statusFilter.set(this.statusFilter() === s ? 'all' : s);
    this.resetWorkshopPaging();
  }

  onSelectDay(dayKey: string | null): void {
    if (dayKey === null) {
      this.selectedDayKey.set(null);
      this.resetWorkshopPaging();
      return;
    }
    this.selectedDayKey.set(this.selectedDayKey() === dayKey ? null : dayKey);
    this.resetWorkshopPaging();
  }

  onSelectCategory(cat: WorkshopFilterCategory): void {
    this.selectedCategory.set(this.selectedCategory() === cat ? 'all' : cat);
    this.resetWorkshopPaging();
  }

  /** Category <select> change: sets the chosen category directly (no toggle). */
  onCategoryDropdownChange(value: string): void {
    this.selectedCategory.set(value as WorkshopFilterCategory);
    this.resetWorkshopPaging();
  }

  /** Day <select> change: empty value means "all days". */
  onDayDropdownChange(value: string): void {
    this.selectedDayKey.set(value ? value : null);
    this.resetWorkshopPaging();
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

  /** Chip title line, e.g. "اليوم الأول (20)" / "Day First (20)". */
  dayLabelWithCount(dayIndex: number, count: number): string {
    return `${this.dayLabel(dayIndex)} (${count})`;
  }

  /** Trim and return the host name when present. */
  presenterName(ws: EnrolledWorkshop): string | null {
    const raw = ws.event.host_name?.trim();
    return raw && raw.length > 0 ? raw : null;
  }

  presenterInitials(ws: EnrolledWorkshop): string {
    return getPresenterInitialsFromHostName(ws.event.host_name);
  }

  workshopDateLong(ws: EnrolledWorkshop): string {
    if (!ws.event.starts_at) {
      return '';
    }
    return formatCardDateLong(ws.event.starts_at, this.i18n.locale() === 'ar' ? 'ar' : 'en');
  }

  workshopTimeKuwait(ws: EnrolledWorkshop): string {
    if (!ws.event.starts_at) {
      return '';
    }
    return formatTimeKuwait(ws.event.starts_at, this.i18n.locale() === 'ar' ? 'ar' : 'en');
  }

  /** Upcoming-only relative start badge; hidden for live / past. */
  startsInLabel(ws: EnrolledWorkshop): string | null {
    if (ws.event.status !== 'upcoming' || !ws.event.starts_at) {
      return null;
    }
    return formatStartsInCompact(ws.event.starts_at, this.i18n.locale() === 'ar' ? 'ar' : 'en');
  }

  clearFilters(): void {
    this.searchText.set('');
    this.statusFilter.set('all');
    this.selectedDayKey.set(null);
    this.selectedCategory.set('all');
    this.resetWorkshopPaging();
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
