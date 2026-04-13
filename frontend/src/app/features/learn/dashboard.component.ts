import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { LearnService } from '../../core/services/learn.service';
import { EnrolledWorkshop } from '../../core/models/learn.types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="space-y-8">

      <!-- ─── Welcome Hero ─── -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 sm:p-8">
        <div class="absolute top-0 right-0 w-72 h-72 bg-brand-600/10 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-48 h-48 bg-indigo-600/10 rounded-full translate-y-1/3 -translate-x-1/3 blur-2xl"></div>
        <div class="relative z-10">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-xl font-bold text-white">
              {{ userInitial }}
            </div>
            <div>
              <p class="text-sm text-white/50">Welcome back,</p>
              <h1 class="text-xl sm:text-2xl font-bold text-white">{{ userName }}</h1>
            </div>
          </div>
          <p class="text-sm text-white/40 max-w-md">Pick up where you left off or explore your enrolled workshops below.</p>
        </div>
      </div>

      @if (loading()) {
        <!-- Skeleton -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-pulse">
          @for (_ of [1,2,3,4]; track _) {
            <div class="bg-white rounded-xl border border-slate-100 p-5 space-y-2"><div class="h-8 w-12 bg-slate-100 rounded-lg mx-auto"></div><div class="h-3 w-16 bg-slate-100 rounded mx-auto"></div></div>
          }
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          @for (_ of [1,2,3]; track _) {
            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden"><div class="aspect-video bg-slate-100"></div><div class="p-4 space-y-2"><div class="h-4 w-3/4 bg-slate-100 rounded"></div><div class="h-3 w-1/2 bg-slate-50 rounded"></div></div></div>
          }
        </div>
      } @else if (workshops().length === 0) {
        <!-- Empty State -->
        <div class="text-center py-20 px-4">
          <div class="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-brand-50 to-indigo-50 mb-6">
            <svg class="h-12 w-12 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-slate-800 mb-2">No workshops yet</h2>
          <p class="text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">You haven't been enrolled in any workshops yet. Browse our catalog or contact an administrator to get started.</p>
          <a routerLink="/" fragment="workshops"
             class="inline-flex items-center gap-2 px-6 py-3 bg-brand-900 text-white text-sm font-semibold rounded-xl hover:bg-brand-800 transition-all shadow-lg shadow-brand-900/20 hover:shadow-xl hover:shadow-brand-900/30 active:scale-[0.98]">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            Browse Workshops
          </a>
        </div>
      } @else {

        <!-- ─── Stats Cards ─── -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow group">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-50 mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg class="h-5 w-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <div class="text-center"><div class="text-2xl font-bold text-brand-900">{{ workshops().length }}</div><div class="text-[11px] text-slate-400 mt-0.5 font-medium">Enrolled</div></div>
          </div>
          <div class="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow group">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-50 mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg class="h-5 w-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="text-center"><div class="text-2xl font-bold text-emerald-600">{{ completedCount() }}</div><div class="text-[11px] text-slate-400 mt-0.5 font-medium">Completed</div></div>
          </div>
          <div class="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow group">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg class="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            </div>
            <div class="text-center"><div class="text-2xl font-bold text-amber-600">{{ inProgressCount() }}</div><div class="text-[11px] text-slate-400 mt-0.5 font-medium">In Progress</div></div>
          </div>
          <div class="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow group">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 mb-3 mx-auto group-hover:scale-110 transition-transform">
              <svg class="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <div class="text-center"><div class="text-2xl font-bold text-slate-400">{{ notStartedCount() }}</div><div class="text-[11px] text-slate-400 mt-0.5 font-medium">Not Started</div></div>
          </div>
        </div>

        <!-- ─── Continue Learning (first in-progress workshop) ─── -->
        @if (continueWorkshop(); as cw) {
          <div class="bg-gradient-to-r from-brand-50/50 to-indigo-50/50 rounded-2xl border border-brand-100/50 p-5 sm:p-6">
            <p class="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-3">Continue Learning</p>
            <a [routerLink]="['/learn', cw.event.id]" class="flex items-center gap-5 group">
              <div class="relative shrink-0 w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-200 shadow-md">
                @if (cw.event.image_url) {
                  <img [src]="cw.event.image_url" [alt]="cw.event.title_en || cw.event.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                }
                <div class="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg class="h-5 w-5 text-brand-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l12 6-12 6V4z"/></svg>
                  </div>
                </div>
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/30"><div class="h-full bg-brand-600" [style.width.%]="cw.progress_percent"></div></div>
              </div>
              <div class="min-w-0">
                <h3 class="font-bold text-slate-900 group-hover:text-brand-700 transition-colors line-clamp-1">{{ cw.event.title_en || cw.event.title }}</h3>
                <p class="text-sm text-slate-500 mt-1">{{ cw.completed_lessons_count }} of {{ cw.lessons_count }} lessons completed</p>
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex-1 h-1.5 bg-slate-200 rounded-full max-w-[200px]"><div class="h-full bg-brand-600 rounded-full" [style.width.%]="cw.progress_percent"></div></div>
                  <span class="text-xs font-semibold text-brand-600">{{ cw.progress_percent }}%</span>
                </div>
              </div>
            </a>
          </div>
        }

        <!-- ─── Workshop Grid ─── -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-bold text-slate-900">My Workshops</h2>
            <span class="text-xs text-slate-400">{{ workshops().length }} workshops</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (ws of workshops(); track ws.id) {
              <a [routerLink]="['/learn', ws.event.id]"
                 class="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1">
                <!-- Thumbnail -->
                <div class="relative aspect-video bg-slate-100 overflow-hidden">
                  @if (ws.event.image_url) {
                    <img [src]="ws.event.image_url" [alt]="ws.event.title_en || ws.event.title"
                         class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out">
                  } @else {
                    <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-indigo-100">
                      <svg class="h-14 w-14 text-brand-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                  }
                  <!-- Play overlay -->
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div class="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <svg class="h-5 w-5 text-brand-700 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l12 6-12 6V4z"/></svg>
                    </div>
                  </div>
                  <!-- Progress bar -->
                  <div class="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
                    <div class="h-full transition-all duration-700"
                         [class.bg-emerald-500]="ws.progress_percent === 100"
                         [class.bg-brand-500]="ws.progress_percent < 100"
                         [style.width.%]="ws.progress_percent"></div>
                  </div>
                  <!-- Badges -->
                  @if (ws.progress_percent === 100) {
                    <div class="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      COMPLETED
                    </div>
                  } @else if (ws.progress_percent > 0) {
                    <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {{ ws.progress_percent }}%
                    </div>
                  }
                </div>

                <!-- Content -->
                <div class="p-4">
                  <h3 class="font-semibold text-slate-900 line-clamp-2 text-[13px] leading-snug group-hover:text-brand-700 transition-colors">
                    {{ ws.event.title_en || ws.event.title }}
                  </h3>

                  <!-- Lesson Pills -->
                  <div class="flex items-center gap-1 mt-3">
                    @for (dot of lessonDots(ws); track dot.i) {
                      <div class="h-1 flex-1 rounded-full"
                           [class.bg-emerald-400]="dot.done"
                           [class.bg-slate-200]="!dot.done">
                      </div>
                    }
                  </div>

                  <div class="flex items-center justify-between mt-2.5">
                    <span class="text-[11px] text-slate-400">{{ ws.completed_lessons_count }}/{{ ws.lessons_count }} lessons</span>
                    <span class="text-[11px] font-semibold"
                          [class.text-emerald-600]="ws.progress_percent === 100"
                          [class.text-brand-600]="ws.progress_percent > 0 && ws.progress_percent < 100"
                          [class.text-slate-400]="ws.progress_percent === 0">
                      {{ ws.progress_percent === 0 ? 'Start' : ws.progress_percent === 100 ? 'Review' : 'Continue' }}
                    </span>
                  </div>
                </div>
              </a>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  readonly auth = inject(AuthService);
  private learnService = inject(LearnService);

  get userName(): string {
    return this.auth.user()?.name ?? 'Learner';
  }

  get userInitial(): string {
    return (this.auth.user()?.name ?? 'L').charAt(0).toUpperCase();
  }

  workshops = signal<EnrolledWorkshop[]>([]);
  loading = signal(true);

  completedCount = signal(0);
  inProgressCount = signal(0);
  notStartedCount = signal(0);

  continueWorkshop = computed(() => {
    return this.workshops().find(w => w.progress_percent > 0 && w.progress_percent < 100)
      ?? this.workshops().find(w => w.progress_percent === 0)
      ?? null;
  });

  ngOnInit(): void {
    this.learnService.getMyWorkshops().subscribe({
      next: ({ data }) => {
        this.workshops.set(data);
        this.completedCount.set(data.filter(w => w.progress_percent === 100).length);
        this.inProgressCount.set(data.filter(w => w.progress_percent > 0 && w.progress_percent < 100).length);
        this.notStartedCount.set(data.filter(w => w.progress_percent === 0).length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  lessonDots(ws: EnrolledWorkshop): { i: number; done: boolean }[] {
    const count = Math.min(ws.lessons_count, 10);
    const completed = ws.completed_lessons_count;
    return Array.from({ length: count }, (_, i) => ({ i, done: i < completed }));
  }
}
