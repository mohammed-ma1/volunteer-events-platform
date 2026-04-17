import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { NgClass, formatDate } from '@angular/common';
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

const CATEGORY_ORDER: WorkshopFilterCategory[] = [
  'all',
  'personal',
  'professional',
];

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
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
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

        <!-- ─── Next Session Spotlight ─── -->
        @if (nextSession(); as ns) {
          <div class="relative overflow-hidden rounded-2xl p-5 sm:p-6"
               [ngClass]="ns.event.status === 'ongoing'
                 ? 'bg-gradient-to-br from-emerald-50 to-emerald-100/60 border-2 border-emerald-300'
                 : 'bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200'">

            @if (ns.event.status === 'ongoing') {
              <div class="absolute top-0 right-0 w-40 h-40 bg-emerald-400/15 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            }

            <div class="relative z-10">
              <div class="flex items-center gap-2 mb-3">
                @if (ns.event.status === 'ongoing') {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-lg animate-pulse">
                    <span class="w-2 h-2 rounded-full bg-white"></span> {{ tr('الجلسة التالية مباشرة الآن', 'Next Session is LIVE') }}
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    {{ tr('الجلسة التالية', 'Up Next') }}
                  </span>
                }
              </div>

              <div class="flex flex-col sm:flex-row gap-4">
                <div class="relative shrink-0 w-full sm:w-40 aspect-video sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-200 shadow-md">
                  @if (ns.event.image_url) {
                    <img [src]="ns.event.image_url" [alt]="workshopTitle(ns)" class="w-full h-full object-cover">
                  }
                </div>

                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-slate-900 line-clamp-2">{{ workshopTitle(ns) }}</h3>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                    @if (safeDate(ns.event.starts_at, 'EEE, MMM d'); as d) {
                      <span class="inline-flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {{ d }}
                      </span>
                    }
                    @if (safeDate(ns.event.starts_at, 'h:mm a'); as t) {
                      <span class="inline-flex items-center gap-1.5">
                        <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {{ t }}
                      </span>
                    }
                  </div>

                  @if (ns.event.status === 'upcoming' && countdown()) {
                    <div class="flex items-center gap-2.5 mt-3">
                      <span class="text-xs font-semibold uppercase tracking-wider text-blue-600">{{ tr('تبدأ خلال', 'Starts in') }}</span>
                      <div class="flex items-center gap-1.5">
                        @if (countdown()!.days > 0) {
                          <span class="inline-flex flex-col items-center px-2.5 py-1 bg-white rounded-lg border border-blue-100 min-w-[42px] shadow-sm">
                            <span class="text-base font-bold text-blue-700">{{ countdown()!.days }}</span>
                            <span class="text-[9px] text-slate-400 font-medium">{{ tr('أيام', 'DAYS') }}</span>
                          </span>
                        }
                        <span class="inline-flex flex-col items-center px-2.5 py-1 bg-white rounded-lg border border-blue-100 min-w-[42px] shadow-sm">
                          <span class="text-base font-bold text-blue-700">{{ countdown()!.hours }}</span>
                          <span class="text-[9px] text-slate-400 font-medium">{{ tr('ساعات', 'HRS') }}</span>
                        </span>
                        <span class="inline-flex flex-col items-center px-2.5 py-1 bg-white rounded-lg border border-blue-100 min-w-[42px] shadow-sm">
                          <span class="text-base font-bold text-blue-700">{{ countdown()!.minutes }}</span>
                          <span class="text-[9px] text-slate-400 font-medium">{{ tr('دقائق', 'MIN') }}</span>
                        </span>
                        <span class="inline-flex flex-col items-center px-2.5 py-1 bg-white rounded-lg border border-blue-100 min-w-[42px] shadow-sm">
                          <span class="text-base font-bold text-blue-700">{{ countdown()!.seconds }}</span>
                          <span class="text-[9px] text-slate-400 font-medium">{{ tr('ثواني', 'SEC') }}</span>
                        </span>
                      </div>
                    </div>
                  }

                  <div class="flex items-center gap-2 mt-4">
                    @if (ns.event.zoom_link && ns.event.status !== 'completed') {
                      <a [href]="ns.event.zoom_link" target="_blank" rel="noopener"
                         class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-all"
                         [ngClass]="ns.event.status === 'ongoing' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'">
                        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        {{ ns.event.status === 'ongoing' ? tr('انضم للجلسة المباشرة', 'Join Live Session') : tr('انضم عبر زوم', 'Join Zoom') }}
                      </a>
                    }
                    <button type="button"
                            class="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition"
                            (click)="openWorkshop(ns)">
                      {{ tr('تفاصيل', 'Details') }}
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ─── Search + Filters ─── -->
        <div class="space-y-4">
          <!-- Search -->
          <label class="flex w-full items-center gap-2.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-brand-900/25 focus-within:ring-2 focus-within:ring-brand-900/10">
            <svg class="h-5 w-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input
              class="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              [placeholder]="tr('ابحث في ورشك...', 'Search your workshops...')"
              [(ngModel)]="searchText"
            />
          </label>

          <!-- Day Tabs -->
          @if (dayBuckets().length > 1) {
            <div class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              @for (b of dayBuckets(); track b.key; let di = $index) {
                <button type="button"
                        (click)="onSelectDay(b.key)"
                        class="shrink-0 rounded-full px-5 py-2 text-center transition duration-200"
                        [ngClass]="selectedDayKey() === b.key
                          ? 'bg-brand-900 text-white shadow-md'
                          : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'">
                  <span class="block text-sm font-bold">{{ tr('اليوم', 'Day') }} {{ di + 1 }}</span>
                  <span class="mt-0.5 block text-[11px] font-medium"
                        [ngClass]="selectedDayKey() === b.key ? 'text-white/80' : 'text-slate-400'">{{ b.sub }}</span>
                </button>
              }
            </div>
          }

          <!-- Category Chips -->
          <div class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            @for (cat of CATEGORY_ORDER; track cat) {
              <button type="button" (click)="onSelectCategory(cat)"
                      class="shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.98]"
                      [ngClass]="selectedCategory() === cat
                        ? 'bg-brand-900 text-white shadow-md'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'">
                {{ categoryLabel(cat) }}
              </button>
            }
          </div>

          <!-- Status Chips (mobile-friendly alt to the stat cards) -->
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
        </div>

        <!-- ─── Workshop Cards Grid ─── -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">{{ tr('ورشــي', 'My Workshops') }}</h2>
            <span class="text-xs text-slate-400 font-medium">{{ filteredWorkshops().length }} {{ tr('ورشة', 'workshops') }}</span>
          </div>

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
              <div class="group relative overflow-hidden rounded-2xl border bg-white hover:shadow-lg transition-all duration-300 cursor-pointer"
                   [ngClass]="ws.event.status === 'ongoing' ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-100'"
                   role="button" tabindex="0"
                   (click)="openWorkshop(ws)"
                   (keydown.enter)="openWorkshop(ws)"
                   (keydown.space)="openWorkshop(ws); $event.preventDefault()">

                <!-- Image -->
                <div class="relative aspect-[16/9] overflow-hidden bg-slate-100">
                  @if (ws.event.image_url) {
                    <img [src]="ws.event.image_url" [alt]="workshopTitle(ws)" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-100">
                      <svg class="h-10 w-10 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    </div>
                  }
                  <!-- Status Badge -->
                  <div class="absolute top-2.5 left-2.5">
                    @if (ws.event.status === 'ongoing') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow bg-emerald-600 text-white">
                        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        {{ tr('مباشر', 'LIVE') }}
                      </span>
                    } @else if (ws.event.status === 'upcoming') {
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow bg-blue-600 text-white">{{ tr('قادمة', 'UPCOMING') }}</span>
                    } @else {
                      <span class="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold shadow bg-slate-500 text-white">{{ tr('مكتملة', 'ENDED') }}</span>
                    }
                  </div>
                  <!-- Zoom Quick-Join Overlay -->
                  @if (ws.event.zoom_link && ws.event.status !== 'completed') {
                    <a [href]="ws.event.zoom_link" target="_blank" rel="noopener"
                       (click)="$event.stopPropagation()"
                       class="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 active:scale-[0.97]"
                       [ngClass]="ws.event.status === 'ongoing' ? 'bg-emerald-600/90' : 'bg-blue-600/90'">
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                      {{ ws.event.status === 'ongoing' ? tr('انضم الآن', 'Join Now') : tr('زوم', 'Zoom') }}
                    </a>
                  }
                </div>

                <!-- Content -->
                <div class="p-4">
                  <h3 class="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">{{ workshopTitle(ws) }}</h3>

                  @if (workshopSummary(ws)) {
                    <p class="text-xs text-slate-400 mt-1 line-clamp-1">{{ workshopSummary(ws) }}</p>
                  }

                  <!-- Date / Time -->
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[11px] text-slate-500">
                    @if (safeDate(ws.event.starts_at, 'MMM d'); as d) {
                      <span class="inline-flex items-center gap-1">
                        <svg class="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                        {{ d }}
                      </span>
                    }
                    @if (safeDate(ws.event.starts_at, 'h:mm a'); as t) {
                      <span class="inline-flex items-center gap-1">
                        <svg class="h-3.5 w-3.5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        {{ t }}
                      </span>
                    }
                  </div>

                  <!-- Footer -->
                  <div class="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-100">
                    @if (ws.event.status === 'upcoming' && ws.event.starts_at) {
                      <span class="text-[11px] font-semibold text-blue-600">{{ getRelativeTime(ws.event.starts_at) }}</span>
                    } @else if (ws.event.status === 'ongoing') {
                      <span class="text-[11px] font-semibold text-emerald-600">{{ tr('جارية الآن', 'In progress') }}</span>
                    } @else {
                      <span class="text-[11px] text-slate-400">{{ tr('انتهت', 'Ended') }}</span>
                    }

                    @if (ws.event.zoom_link && ws.event.status !== 'completed') {
                      <a [href]="ws.event.zoom_link" target="_blank" rel="noopener"
                         (click)="$event.stopPropagation()"
                         class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold text-white shadow-sm transition active:scale-[0.97]"
                         [ngClass]="ws.event.status === 'ongoing' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700'">
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        {{ ws.event.status === 'ongoing' ? tr('انضم الآن', 'Join Now') : tr('انضم عبر زوم', 'Join Zoom') }}
                      </a>
                    } @else if (ws.event.status === 'completed') {
                      <span class="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        {{ tr('منتهية', 'Done') }}
                      </span>
                    } @else {
                      <span class="text-[11px] text-brand-600 font-semibold group-hover:underline">{{ tr('التفاصيل', 'Details') }} &rarr;</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  readonly auth = inject(AuthService);
  readonly i18n = inject(I18nService);
  private learnService = inject(LearnService);
  private router = inject(Router);

  readonly STATUS_FILTERS: StatusFilter[] = ['all', 'upcoming', 'ongoing', 'completed'];
  readonly CATEGORY_ORDER = CATEGORY_ORDER;

  workshops = signal<EnrolledWorkshop[]>([]);
  loading = signal(true);
  searchText = '';
  readonly statusFilter = signal<StatusFilter>('all');
  readonly selectedDayKey = signal<string | null>(null);
  readonly selectedCategory = signal<WorkshopFilterCategory>('all');

  upcomingCount = signal(0);
  ongoingCount = signal(0);
  completedCount = signal(0);

  countdown = signal<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  private countdownInterval: ReturnType<typeof setInterval> | null = null;

  nextSession = computed(() => {
    const ws = this.workshops();
    return ws.find(w => w.event.status === 'ongoing') ?? ws.find(w => w.event.status === 'upcoming') ?? null;
  });

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

    const q = this.searchText.trim().toLowerCase();
    if (q) {
      list = list.filter((w) => {
        const title = (w.event.title + ' ' + (w.event.title_en ?? '')).toLowerCase();
        const summary = ((w.event.summary ?? '') + ' ' + (w.event.summary_en ?? '')).toLowerCase();
        return title.includes(q) || summary.includes(q);
      });
    }

    return list;
  });

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
        this.startCountdown();
      },
      error: () => this.loading.set(false),
    });
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  onSelectStatus(s: StatusFilter): void {
    this.statusFilter.set(this.statusFilter() === s ? 'all' : s);
  }

  onSelectDay(dayKey: string): void {
    this.selectedDayKey.set(this.selectedDayKey() === dayKey ? null : dayKey);
  }

  onSelectCategory(cat: WorkshopFilterCategory): void {
    this.selectedCategory.set(this.selectedCategory() === cat ? 'all' : cat);
  }

  categoryLabel(cat: WorkshopFilterCategory): string {
    return this.i18n.t(`cat.${cat}` as TranslationKey);
  }

  clearFilters(): void {
    this.searchText = '';
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

  /** Format an ISO/date string safely. Returns null for invalid input so the
   *  template can `@if` on it instead of crashing the DatePipe (NG02100). */
  safeDate(value: string | null | undefined, format: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    try {
      return formatDate(d, format, 'en-US');
    } catch {
      return null;
    }
  }

  getRelativeTime(dateStr: string): string {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) return this.tr('بدأت الآن', 'Starting now');

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return this.isArabic()
        ? `تبدأ خلال ${days}ي ${hours}س`
        : `Starts in ${days}d ${hours}h`;
    }
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
      return this.isArabic()
        ? `تبدأ خلال ${hours}س ${minutes}د`
        : `Starts in ${hours}h ${minutes}m`;
    }
    return this.isArabic() ? `تبدأ خلال ${minutes}د` : `Starts in ${minutes}m`;
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

  private startCountdown(): void {
    this.updateCountdown();
    this.countdownInterval = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const ns = this.nextSession();
    if (!ns || ns.event.status !== 'upcoming' || !ns.event.starts_at) {
      this.countdown.set(null);
      return;
    }

    const target = new Date(ns.event.starts_at).getTime();
    const diff = Math.max(0, target - Date.now());

    this.countdown.set({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    });
  }
}
