import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { getDummyBySlug, HomeListEvent, volunteerToHome } from '../../core/data/dummy-events';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { VolunteerEvent } from '../../core/models/api.types';
import { EnrolledWorkshop } from '../../core/models/learn.types';
import { CartService } from '../../core/services/cart.service';
import { EventsService } from '../../core/services/events.service';
import { BitaStatus, EventCompletionState, LearnService } from '../../core/services/learn.service';
import { catchError, of } from 'rxjs';

/** Zoom join button is unlocked this many minutes before workshop start. */
@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, NgClass],
  template: `
    @if (error()) {
      <p class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        {{ error() }}
      </p>
    } @else {
      @if (event(); as ev) {

      @if (isOwned()) {
        <!-- ─────────────── Enrolled-learner view ─────────────── -->

        <!-- Hero: back link in its own top row; below it, content (start) + image (end). -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-[#1f2937] shadow-xl">
          @if (ev.image_url) {
            <div class="absolute inset-0">
              <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover opacity-15 blur-md scale-105" loading="lazy"/>
              <div class="absolute inset-0 bg-gradient-to-t from-[#0b1220] via-[#0b1220]/85 to-[#0b1220]/40"></div>
            </div>
          }

          <div class="relative z-10 px-5 pt-4 pb-6 sm:px-8 sm:pt-5 sm:pb-8">
            <!-- Back link, anchored to the END side (left in RTL, right in LTR) -->
            <div class="flex justify-end">
              <a routerLink="/dashboard" class="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition hover:text-white">
                <svg class="h-4 w-4" [class.rotate-180]="i18n.isRtl()" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                {{ tr('العودة للورش', 'Back to Workshops') }}
              </a>
            </div>

            <!-- Content (start) + thumbnail (end). DOM order is content→image so RTL puts content on the RIGHT and the image on the LEFT, matching the design. -->
            <div class="mt-2 flex flex-col gap-6 sm:mt-3 sm:flex-row sm:items-center">
              <div class="flex-1 min-w-0">
                <span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 px-3 py-1 text-[11px] font-bold text-white shadow ring-1 ring-emerald-300/40">
                  <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                  {{ tr('مسجّل', 'Enrolled') }}
                </span>

                <h1 class="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">{{ title(ev) }}</h1>

                @if (hostName(); as h) {
                  <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur">
                    <svg class="h-4 w-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    {{ h }}
                  </div>
                }

                <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/70">
                  @if (ev.starts_at) {
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="h-4 w-4 text-white/45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                      {{ ev.starts_at | date: 'd MMMM y' : undefined : dateLocale() }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="h-4 w-4 text-white/45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      {{ ev.starts_at | date:'h:mm a' : undefined : dateLocale() }}
                    </span>
                  }
                  @if (location(ev); as loc) {
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="h-4 w-4 text-white/45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                      {{ loc }}
                    </span>
                  }
                </div>
              </div>

              <div class="shrink-0 w-full sm:w-72 lg:w-80 aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-700/40">
                @if (ev.image_url) {
                  <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover" loading="lazy"/>
                } @else {
                  <div class="h-full w-full bg-gradient-to-br from-brand-800 to-indigo-900 flex items-center justify-center">
                    <svg class="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Body grid -->
        <div class="mt-8 grid gap-6 lg:grid-cols-[1fr,340px]">
          <!-- Main column -->
          <div class="space-y-6 order-2 lg:order-1">
            <!-- About -->
            <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 class="mb-3 text-base font-bold text-slate-900">{{ tr('عن الورشة', 'About this workshop') }}</h2>
              <p class="text-sm leading-relaxed text-slate-600">{{ body(ev) }}</p>
            </section>

            <!-- Live broadcast link -->
            <section class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h3 class="mb-4 text-base font-bold text-slate-900">{{ tr('رابط البث المباشر', 'Live broadcast link') }}</h3>
              <div class="flex flex-col items-center gap-3 py-2">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                  @if (zoomAvailable()) {
                    <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"/></svg>
                  } @else {
                    <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v3M5 11h14a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2z"/></svg>
                  }
                </div>
                <p class="max-w-xs text-center text-sm text-slate-500">
                  @if (zoomAvailable()) {
                    {{ tr('الجلسة جاهزة للانضمام عبر زوم', 'The session is ready — join via Zoom') }}
                  } @else if (workshopStatus() === 'completed') {
                    {{ tr('انتهت هذه الورشة', 'This workshop has ended') }}
                  } @else {
                    {{ tr('سيتم إضافة رابط زوم لهذه الورشة قريباً', 'The Zoom link for this workshop will be added soon') }}
                  }
                </p>

                @if (zoomAvailable() && zoomLink()) {
                  <a [href]="zoomLink()!" target="_blank" rel="noopener"
                     class="group relative mt-1 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#2D8CFF] via-[#2563eb] to-[#4f46e5] px-7 py-3 text-sm font-extrabold tracking-wide text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 active:scale-[0.97] motion-safe:animate-ve-cta-ring">
                    <!-- hover shimmer sweep -->
                    <span
                      class="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
                      aria-hidden="true"
                    ></span>
                    <!-- live "ready" pulse dot -->
                    <span class="relative flex h-2.5 w-2.5" aria-hidden="true">
                      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80 opacity-75 motion-reduce:animate-none"></span>
                      <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
                    </span>
                    <svg class="relative h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    <span class="relative">{{ tr('انضم عبر زوم', 'Join via Zoom') }}</span>
                  </a>
                } @else {
                  <button type="button" disabled
                          class="mt-1 inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-400">
                    <svg class="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                    {{ tr('انضمام عبر زوم', 'Join via Zoom') }}
                  </button>
                }
              </div>
            </section>

            <!-- Recording: real player when an URL is set, dashed placeholder otherwise. -->
            @if (recordingUrl(); as recUrl) {
              <section class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
                <h3 class="mb-4 text-base font-bold text-slate-900">{{ tr('تسجيل الورشة', 'Workshop recording') }}</h3>
                <div class="overflow-hidden rounded-xl bg-black ring-1 ring-slate-200">
                  @if (isStreamUrl(recUrl)) {
                    <iframe
                      class="block aspect-video w-full"
                      [src]="safeStreamUrl(recUrl)"
                      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                      allowfullscreen
                      loading="lazy"
                      referrerpolicy="no-referrer"
                    ></iframe>
                  } @else {
                    <video
                      class="block aspect-video w-full"
                      [src]="recUrl"
                      controls
                      controlsList="nodownload"
                      preload="metadata"
                      playsinline
                    ></video>
                  }
                </div>
              </section>
            } @else {
              <section class="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-6">
                <h3 class="mb-4 text-base font-bold text-slate-900">{{ tr('تسجيل الورشة', 'Workshop recording') }}</h3>
                <div class="flex flex-col items-center gap-3 py-10">
                  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                    <svg class="h-7 w-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                  </div>
                  <p class="max-w-xs text-center text-sm text-slate-500">{{ tr('سيتم إضافة تسجيل الورشة هنا لمشاهدتها لاحقاً بعد انتهائها', 'The workshop recording will be added here so you can watch it later after the session ends') }}</p>
                </div>
              </section>
            }

            <!-- "I completed viewing" — always available. Each completion counts
                 toward the BITA certificate request (completed_count). -->
            @if (completion()?.completed) {
              <button type="button"
                      [disabled]="marking()"
                      (click)="markUncompleted()"
                      [title]="tr('اضغط للتراجع عن إكمال المشاهدة', 'Click to undo completion')"
                      class="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:cursor-wait disabled:opacity-60 active:scale-[0.99]">
                @if (marking()) {
                  <svg class="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="3" class="opacity-25"/><path stroke-linecap="round" stroke-width="3" d="M21 12a9 9 0 01-9 9" class="opacity-75"/></svg>
                } @else {
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                }
                {{ tr('تم إكمال المشاهدة', 'You completed viewing') }}
              </button>
            } @else {
              <button type="button"
                      [disabled]="marking()"
                      (click)="markCompleted()"
                      class="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-900 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-800 disabled:cursor-wait disabled:opacity-60 active:scale-[0.99]">
                @if (marking()) {
                  <svg class="h-5 w-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="3" class="opacity-25"/><path stroke-linecap="round" stroke-width="3" d="M21 12a9 9 0 01-9 9" class="opacity-75"/></svg>
                } @else {
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                }
                {{ tr('اضغط هنا إذا أكملت المشاهدة', 'Click here if you completed viewing') }}
              </button>
            }
          </div>

          <!-- Sidebar -->
          <aside class="space-y-4 order-1 lg:order-2">
            <div class="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 shadow-sm">
              <div class="flex items-center justify-center gap-2 text-emerald-700">
                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                <span class="text-sm font-bold">{{ tr('أنت مسجّل في هذه الورشة', 'You are enrolled in this workshop') }}</span>
              </div>
            </div>

            <button type="button"
                    class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    (click)="goBackToMyWorkshops()">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"/></svg>
              {{ tr('العودة إلى ورشي', 'Back to My Workshops') }}
            </button>

            <!-- Certificate card. Yellow CTA matches the design; clicking before
                 marking as watched shows a red toast instead of calling the API. -->
            <div class="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 shadow-sm">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                  <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M5 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2l-3 3-3-3H7a2 2 0 01-2-2V7z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-bold text-slate-900">{{ tr('الشهادة', 'Certificate') }}</p>
                  <p class="text-xs text-slate-500">{{ tr('احصل على شهادة الإتمام بصيغة PDF', 'Get your PDF certificate of completion') }}</p>
                </div>
              </div>

              <button type="button"
                      [disabled]="downloadingCertificate()"
                      (click)="onDownloadCertificate()"
                      class="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-bold text-amber-950 shadow-sm transition hover:bg-amber-300 disabled:cursor-wait disabled:opacity-60 active:scale-[0.99]">
                @if (downloadingCertificate()) {
                  <svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="3" class="opacity-25"/><path stroke-linecap="round" stroke-width="3" d="M21 12a9 9 0 01-9 9" class="opacity-75"/></svg>
                } @else {
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/></svg>
                }
                {{ tr('اضغط هنا لتحميل الشهادة', 'Click here to download your certificate') }}
              </button>

              @if (certAlertVisible()) {
                <div role="alert"
                     class="mt-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                  <svg class="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a1 1 0 011 1v3a1 1 0 11-2 0V7a1 1 0 011-1zm0 7a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd"/></svg>
                  <span>
                    <strong class="block font-bold">{{ tr('تنبيه', 'Heads up') }}</strong>
                    {{ tr('تعذّر تحميل الشهادة الآن، يرجى المحاولة مرة أخرى', 'We could not download the certificate just now, please try again') }}
                  </span>
                </div>
              }
            </div>

            <!-- BITA accredited paper-certificate request. Only shown when the
                 learner bought the add-on; the button gates on completing the
                 required number of workshops via an animated modal. -->
            @if (bitaStatus(); as bs) {
              @if (bs.eligible_purchase) {
                <div
                  class="relative overflow-hidden rounded-2xl border p-5 shadow-sm motion-safe:animate-ve-fade-up"
                  [ngClass]="bs.requested_at
                    ? 'border-emerald-200 bg-gradient-to-b from-emerald-50 to-white'
                    : 'border-amber-200 bg-gradient-to-b from-amber-50 via-white to-amber-50/40'"
                >
                  <span aria-hidden="true" class="pointer-events-none absolute inset-0 motion-safe:animate-pulse opacity-40">
                    <span class="absolute top-3 end-4 h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                    <span class="absolute bottom-4 start-5 h-1 w-1 rounded-full bg-amber-300"></span>
                    <span class="absolute top-6 start-10 h-1 w-1 rounded-full bg-emerald-300"></span>
                  </span>

                  <div class="relative flex items-center gap-3">
                    <div class="relative flex h-11 w-11 shrink-0 items-center justify-center">
                      <img src="/images/branding/bita-logo.png" alt="BITA" class="h-11 w-11 object-contain drop-shadow-sm" />
                      @if (bs.requested_at) {
                        <span class="absolute -bottom-1 -end-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md ring-2 ring-white">
                          <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                        </span>
                      }
                    </div>
                    <div class="min-w-0">
                      <p class="text-sm font-bold text-slate-900">{{ i18n.t('bitaCert.detailCardTitle') }}</p>
                      <p class="text-xs text-slate-500">{{ i18n.t('bitaCert.detailCardSubtitle') }}</p>
                    </div>
                  </div>

                  @if (!bs.requested_at) {
                    <div class="relative mt-4">
                      <div class="mb-1.5 flex items-center justify-between text-[11px] font-semibold text-amber-700">
                        <span class="tabular-nums">{{ bs.completed_count }} / {{ bs.required_count }}</span>
                        <span class="tabular-nums">{{ bitaProgressPct() }}%</span>
                      </div>
                      <div class="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"
                          [style.width.%]="bitaProgressPct()"
                          style="transition: width 600ms ease-out;"
                        ></div>
                      </div>
                    </div>
                  }

                  <button
                    type="button"
                    [disabled]="bitaRequesting()"
                    (click)="onBitaRequestClick()"
                    class="relative mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold shadow-sm transition active:scale-[0.99] disabled:cursor-progress disabled:opacity-70"
                    [ngClass]="bs.requested_at
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-400 hover:to-orange-400'"
                  >
                    @if (bitaRequesting()) {
                      <svg class="h-4 w-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="3" class="opacity-25"/><path stroke-linecap="round" stroke-width="3" d="M21 12a9 9 0 01-9 9" class="opacity-75"/></svg>
                    } @else if (bs.requested_at) {
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                    } @else {
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M5 7a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2l-3 3-3-3H7a2 2 0 01-2-2V7z"/></svg>
                    }
                    {{ bs.requested_at ? i18n.t('bitaCert.detailRequestedCta') : i18n.t('bitaCert.detailRequestCta') }}
                  </button>

                  @if (bitaErrorToast(); as toast) {
                    <div role="alert" class="relative mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700">
                      {{ toast }}
                    </div>
                  }
                </div>
              }
            }

            <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 class="mb-4 text-sm font-bold text-slate-900">{{ tr('تفاصيل', 'Details') }}</h3>
              <div class="space-y-4">
                @if (hostName(); as h) {
                  <div class="flex items-start gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-pink-50 shrink-0">
                      <svg class="h-4 w-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400 font-medium">{{ tr('مقدم الورشة', 'Presenter') }}</p>
                      <p class="text-sm font-semibold text-slate-900">{{ h }}</p>
                    </div>
                  </div>
                }
                @if (ev.starts_at) {
                  <div class="flex items-start gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 shrink-0">
                      <svg class="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400 font-medium">{{ tr('التاريخ', 'Date') }}</p>
                      <p class="text-sm font-semibold text-slate-900">{{ ev.starts_at | date: 'd MMMM y' : undefined : dateLocale() }}</p>
                    </div>
                  </div>
                  <div class="flex items-start gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 shrink-0">
                      <svg class="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400 font-medium">{{ tr('الوقت', 'Time') }}</p>
                      <p class="text-sm font-semibold text-slate-900">{{ ev.starts_at | date:'h:mm a' }}</p>
                    </div>
                  </div>
                }
                @if (location(ev); as loc) {
                  <div class="flex items-start gap-3">
                    <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 shrink-0">
                      <svg class="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                      <p class="text-xs text-slate-400 font-medium">{{ tr('الموقع', 'Location') }}</p>
                      <p class="text-sm font-semibold text-slate-900">{{ loc }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </aside>
        </div>

      } @else {
        <!-- ─────────────── Public marketing view ─────────────── -->

      <!-- Hero Banner -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        <div class="absolute inset-0">
          @if (ev.image_url) {
            <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover opacity-25 blur-sm" loading="lazy"/>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/70 to-transparent"></div>
        </div>

        <div class="relative z-10 px-6 pt-5 pb-8 sm:px-8 sm:pt-6 sm:pb-10">
          <a routerLink="/" class="inline-flex items-center gap-1.5 text-sm font-medium text-white/60 hover:text-white transition mb-8">
            @if (i18n.isRtl()) {
              <svg class="h-4 w-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            } @else {
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            }
            {{ i18n.t('detail.back') }}
          </a>

          <div class="flex flex-col lg:flex-row lg:items-end lg:gap-8">
            <div class="shrink-0 w-full lg:w-72 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-6 lg:mb-0">
              @if (ev.image_url) {
                <img [src]="ev.image_url" [alt]="title(ev)" class="h-full w-full object-cover" loading="lazy"/>
              } @else {
                <div class="h-full w-full bg-gradient-to-br from-brand-800 to-indigo-900 flex items-center justify-center">
                  <svg class="h-16 w-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                </div>
              }
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-3">
                @if (ev.is_featured) {
                  <span class="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-1 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30">
                    <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ i18n.t('detail.featured') }}
                  </span>
                }
              </div>

              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">{{ title(ev) }}</h1>

              @if (hostName(); as h) {
                <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur">
                  <svg class="h-4 w-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  {{ h }}
                </div>
              }

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
                @if (location(ev); as loc) {
                  <span class="inline-flex items-center gap-1.5">
                    <svg class="h-4 w-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ loc }}
                  </span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr,340px]">
        <div class="space-y-6">
          <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              {{ tr('عن الورشة', 'About this workshop') }}
            </h2>
            <p class="text-base leading-relaxed text-slate-700">{{ body(ev) }}</p>
          </div>
        </div>

        <div class="space-y-4">
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

          <div class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">{{ tr('تفاصيل', 'Details') }}</h3>
            <div class="space-y-3">
              @if (hostName(); as h) {
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-pink-50 shrink-0">
                    <svg class="h-4 w-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium">{{ tr('مقدم الورشة', 'Presenter') }}</p>
                    <p class="text-sm font-semibold text-slate-900">{{ h }}</p>
                  </div>
                </div>
              }
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
              @if (location(ev); as loc) {
                <div class="flex items-start gap-3">
                  <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-50 shrink-0">
                    <svg class="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <p class="text-xs text-slate-400 font-medium">{{ tr('الموقع', 'Location') }}</p>
                    <p class="text-sm font-semibold text-slate-900">{{ loc }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      }

      } @else {
        <div class="flex items-center justify-center py-20">
          <div class="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600"></div>
        </div>
      }
    }

    <!-- ───────────── BITA: "Almost there!" locked-state modal ───────────── -->
    @if (showBitaLockedModal()) {
      <div
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="i18n.t('bitaCert.modalLockedTitle')"
        class="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 motion-safe:animate-ve-fade-in"
      >
        <button
          type="button"
          (click)="closeBitaLockedModal()"
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          [attr.aria-label]="i18n.t('bitaCert.modalCloseAria')"
        ></button>

        <div
          class="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 motion-safe:animate-ve-fade-up"
          [attr.dir]="i18n.isRtl() ? 'rtl' : 'ltr'"
          [attr.lang]="i18n.isRtl() ? 'ar' : 'en'"
        >
          <div class="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100/60 px-6 pt-8 pb-6 text-center">
            <span aria-hidden="true" class="pointer-events-none absolute inset-0">
              <span class="absolute top-3 left-6 h-1.5 w-1.5 rounded-full bg-amber-300 motion-safe:animate-ping"></span>
              <span class="absolute top-8 right-8 h-1 w-1 rounded-full bg-orange-400 motion-safe:animate-pulse" style="animation-delay: 600ms"></span>
              <span class="absolute bottom-4 left-1/3 h-1 w-1 rounded-full bg-amber-400 motion-safe:animate-pulse" style="animation-delay: 1.2s"></span>
              <span class="absolute bottom-8 right-1/4 h-1.5 w-1.5 rounded-full bg-amber-200 motion-safe:animate-ping" style="animation-delay: 900ms"></span>
            </span>

            <div class="relative mx-auto h-32 w-32">
              <svg class="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" stroke="#fde68a" stroke-width="10" fill="none" />
                <circle
                  cx="60" cy="60" r="52"
                  stroke="url(#bita-detail-ring-grad)" stroke-width="10" stroke-linecap="round" fill="none"
                  [attr.stroke-dasharray]="326.7"
                  [attr.stroke-dashoffset]="326.7 - (326.7 * bitaProgressPct() / 100)"
                  style="transition: stroke-dashoffset 800ms cubic-bezier(0.4, 0, 0.2, 1)"
                />
                <defs>
                  <linearGradient id="bita-detail-ring-grad" x1="0" y1="0" x2="1" y2="1">
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

          <div class="px-6 pt-5 pb-6 text-center">
            <p class="text-sm leading-relaxed text-slate-600">{{ i18n.t('bitaCert.modalLockedBody') }}</p>

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
  `,
})
export class EventDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly eventsApi = inject(EventsService);
  private readonly learnApi = inject(LearnService);
  private readonly sanitizer = inject(DomSanitizer);
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  readonly i18n = inject(I18nService);

  readonly event = signal<HomeListEvent | null>(null);
  readonly myWorkshops = signal<EnrolledWorkshop[]>([]);
  /** Watched-state + recording URL for the current enrolled event. Null until loaded. */
  readonly completion = signal<EventCompletionState | null>(null);
  readonly marking = signal(false);
  readonly downloadingCertificate = signal(false);

  // ── BITA paper-certificate request (mirrors the dashboard tile flow) ──────
  readonly bitaStatus = signal<BitaStatus | null>(null);
  readonly bitaRequesting = signal(false);
  readonly showBitaLockedModal = signal(false);
  readonly showBitaSuccessModal = signal(false);
  readonly bitaErrorToast = signal<string | null>(null);
  private bitaToastTimeout: ReturnType<typeof setTimeout> | null = null;
  /** Shows the red "you must watch first" toast under the certificate button. */
  readonly certAlertVisible = signal(false);
  /** Tracks the event id we last fetched completion for, so we don't refetch on every change. */
  private lastCompletionFetchedFor: number | null = null;
  private alertTimeout: ReturnType<typeof setTimeout> | null = null;
  /** Memoised Cloudflare Stream iframe URLs so the SafeResourceUrl is stable across change detection. */
  private readonly safeStreamCache = new Map<string, SafeResourceUrl>();
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

  /** Resolved recording URL (only present once /v1/learn/events/{id}/completion responds for an enrolled viewer). */
  readonly recordingUrl = computed(() => {
    if (!this.isOwned()) {
      return null;
    }
    const url = this.completion()?.recording_url;
    return url && url.trim().length > 0 ? url : null;
  });

  /** Reactive "now" tick (every minute) so zoom availability flips at the
   *  unlock threshold without requiring a page reload. */
  private readonly now = signal(Date.now());
  private nowInterval: ReturnType<typeof setInterval> | null = null;

  /** Workshop status from the enrolled record (the public event payload doesn't include it). */
  readonly workshopStatus = computed(() => this.enrolledWorkshop()?.event.status ?? null);

  /** Zoom link is shown to enrolled learners as soon as it is set, and stays
   *  available until the workshop ends (after which the recording takes over). */
  readonly zoomAvailable = computed(() => {
    const ev = this.event();
    if (!ev || !this.isOwned() || !this.zoomLink()) {
      return false;
    }
    const end = ev.ends_at ? new Date(ev.ends_at).getTime() : null;
    return end === null || this.now() <= end;
  });

  ngOnInit(): void {
    if (this.auth.isAuthenticated()) {
      this.learnApi
        .getMyWorkshops()
        .pipe(catchError(() => of({ data: [] as EnrolledWorkshop[] })))
        .subscribe((res) => {
          this.myWorkshops.set(res.data);
          this.tryLoadCompletion();
        });

      // BITA eligibility/progress is independent of the workshop payload;
      // failures simply leave the card hidden.
      this.learnApi
        .getBitaStatus()
        .pipe(catchError(() => of({ data: null as BitaStatus | null })))
        .subscribe((res) => this.bitaStatus.set(res.data));
    }

    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set(this.i18n.t('detail.notFound'));
      return;
    }
    this.eventsApi.bySlug(slug).subscribe({
      next: (e) => {
        this.event.set(volunteerToHome(e));
        this.tryLoadCompletion();
      },
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

    this.nowInterval = setInterval(() => this.now.set(Date.now()), 60_000);
  }

  ngOnDestroy(): void {
    if (this.nowInterval) {
      clearInterval(this.nowInterval);
    }
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    if (this.bitaToastTimeout) {
      clearTimeout(this.bitaToastTimeout);
    }
  }

  /** Cloudflare Stream iframe URLs use a distinct host; everything else is a direct mp4. */
  isStreamUrl(url: string): boolean {
    return /\bcloudflarestream\.com\b/i.test(url);
  }

  safeStreamUrl(url: string): SafeResourceUrl {
    const cached = this.safeStreamCache.get(url);
    if (cached) {
      return cached;
    }
    const safe = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.safeStreamCache.set(url, safe);
    return safe;
  }

  markCompleted(): void {
    const ev = this.event();
    if (!ev || !this.isOwned() || this.marking() || this.completion()?.completed) {
      return;
    }
    this.marking.set(true);
    this.learnApi.markEventCompleted(ev.id).subscribe({
      next: (res) => {
        // Preserve the recording URL — the toggle endpoints don't echo it back.
        const recordingUrl = this.completion()?.recording_url ?? res.data.recording_url ?? null;
        this.completion.set({ ...res.data, recording_url: recordingUrl });
        this.marking.set(false);
        // Completing a workshop bumps the BITA progress — refresh the card.
        this.refreshBitaStatus();
      },
      error: () => {
        this.marking.set(false);
      },
    });
  }

  /** Undoes a completion so the learner can flip the control back to its default
   *  "Click here if you completed viewing" button. */
  markUncompleted(): void {
    const ev = this.event();
    if (!ev || !this.isOwned() || this.marking() || !this.completion()?.completed) {
      return;
    }
    this.marking.set(true);
    this.learnApi.unmarkEventCompleted(ev.id).subscribe({
      next: (res) => {
        const recordingUrl = this.completion()?.recording_url ?? res.data.recording_url ?? null;
        this.completion.set({ ...res.data, recording_url: recordingUrl });
        this.marking.set(false);
        // Un-completing lowers the BITA progress — refresh the card.
        this.refreshBitaStatus();
      },
      error: () => {
        this.marking.set(false);
      },
    });
  }

  /** Re-fetches BITA eligibility/progress (called after a completion is recorded). */
  private refreshBitaStatus(): void {
    this.learnApi
      .getBitaStatus()
      .pipe(catchError(() => of({ data: null as BitaStatus | null })))
      .subscribe((res) => this.bitaStatus.set(res.data));
  }

  /** Click handler for the detail-page "Request BITA Certificate" button. */
  onBitaRequestClick(): void {
    const s = this.bitaStatus();
    if (!s || !s.eligible_purchase) {
      return;
    }
    if (s.requested_at) {
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

  /** POSTs the request, then flips to the success modal + refreshes status. */
  private submitBitaRequest(): void {
    if (this.bitaRequesting()) {
      return;
    }
    this.bitaRequesting.set(true);
    this.bitaErrorToast.set(null);
    this.learnApi.requestBitaCertificate().subscribe({
      next: (res) => {
        this.bitaStatus.set(res.data);
        this.bitaRequesting.set(false);
        this.showBitaSuccessModal.set(true);
      },
      error: () => {
        this.bitaRequesting.set(false);
        this.bitaErrorToast.set(this.i18n.t('bitaCert.requestErrorToast'));
        if (this.bitaToastTimeout) {
          clearTimeout(this.bitaToastTimeout);
        }
        this.bitaToastTimeout = setTimeout(() => this.bitaErrorToast.set(null), 4000);
      },
    });
  }

  /** BITA progress percentage for the locked-modal ring, clamped to [0, 100]. */
  bitaProgressPct(): number {
    const s = this.bitaStatus();
    if (!s || s.required_count <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((s.completed_count / s.required_count) * 100)));
  }

  onDownloadCertificate(): void {
    const ev = this.event();
    if (!ev || !this.isOwned()) {
      return;
    }
    // Completion gate is temporarily off — any enrolled user can download.
    // Re-enable the `if (!this.completion()?.completed) flashCertAlert()`
    // check when real video-watch tracking lands.
    if (this.downloadingCertificate()) {
      return;
    }
    this.downloadingCertificate.set(true);
    this.learnApi.downloadCertificate(ev.id).subscribe({
      next: (res) => {
        const blob = res.body;
        if (!blob) {
          this.downloadingCertificate.set(false);
          return;
        }
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = `certificate-${ev.slug ?? 'workshop'}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        // Defer revoke a tick so Safari doesn't cancel the download.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        this.downloadingCertificate.set(false);
      },
      error: () => {
        this.downloadingCertificate.set(false);
        this.flashCertAlert();
      },
    });
  }

  /** Pulls the per-event completion state once we know both the event and that
   *  the viewer is enrolled. Idempotent — guarded by `lastCompletionFetchedFor`. */
  private tryLoadCompletion(): void {
    const ev = this.event();
    if (!ev || !this.isOwned()) {
      return;
    }
    if (this.lastCompletionFetchedFor === ev.id) {
      return;
    }
    this.lastCompletionFetchedFor = ev.id;
    this.learnApi
      .getEventCompletion(ev.id)
      .pipe(
        catchError(() =>
          of({ data: { completed: false, completed_at: null, recording_url: null } as EventCompletionState }),
        ),
      )
      .subscribe((res) => this.completion.set(res.data));
  }

  private flashCertAlert(): void {
    this.certAlertVisible.set(true);
    if (this.alertTimeout) {
      clearTimeout(this.alertTimeout);
    }
    this.alertTimeout = setTimeout(() => this.certAlertVisible.set(false), 4000);
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

  /** Presenter / host name from the API (preferred), falling back to enrolled
   *  workshop's host_name. Returns null when nothing useful exists. */
  hostName(): string | null {
    const fromApi = this.event()?.host_name?.trim();
    if (fromApi) {
      return fromApi;
    }
    const fromEnroll = this.enrolledWorkshop()?.event.host_name?.trim();
    return fromEnroll && fromEnroll.length > 0 ? fromEnroll : null;
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
