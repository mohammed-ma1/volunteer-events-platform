import { Component, inject, OnInit, OnDestroy, signal, computed, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { LearnService } from '../../core/services/learn.service';
import { WorkshopDetail, Lesson } from '../../core/models/learn.types';

@Component({
  selector: 'app-workshop-player',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (loading()) {
      <!-- Skeleton Loader -->
      <div class="space-y-4 animate-pulse">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-slate-200"></div>
          <div class="space-y-2"><div class="h-5 w-64 bg-slate-200 rounded-lg"></div><div class="h-3 w-24 bg-slate-100 rounded-lg"></div></div>
        </div>
        <div class="flex gap-5"><div class="flex-1 aspect-video bg-slate-200 rounded-2xl"></div><div class="hidden lg:block w-80 h-96 bg-slate-200 rounded-2xl"></div></div>
      </div>
    } @else if (workshop()) {

      <!-- ─── Top Bar ─── -->
      <div class="flex items-center justify-between gap-4 mb-5">
        <div class="flex items-center gap-3 min-w-0">
          <a routerLink="/dashboard"
             class="shrink-0 w-10 h-10 rounded-xl bg-slate-100 hover:bg-brand-50 flex items-center justify-center text-slate-400 hover:text-brand-700 transition-all group">
            <svg class="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <div class="min-w-0">
            <h1 class="text-lg font-bold text-slate-900 truncate">{{ workshop()!.event.title_en || workshop()!.event.title }}</h1>
            <div class="flex items-center gap-3 mt-0.5">
              <span class="text-xs text-slate-400">{{ lessons().length }} lessons</span>
              <span class="text-xs text-slate-300">&bull;</span>
              <span class="text-xs font-medium" [class.text-emerald-600]="overallProgress() === 100" [class.text-brand-600]="overallProgress() < 100">{{ overallProgress() }}% complete</span>
            </div>
          </div>
        </div>

        <!-- Overall Progress Ring -->
        <div class="hidden sm:flex items-center gap-3 shrink-0">
          <div class="relative w-12 h-12">
            <svg class="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#e2e8f0" stroke-width="3"/>
              <circle cx="18" cy="18" r="15.5" fill="none" stroke-width="3" stroke-linecap="round"
                      [attr.stroke]="overallProgress() === 100 ? '#10b981' : '#4f46e5'"
                      [attr.stroke-dasharray]="97.4"
                      [attr.stroke-dashoffset]="97.4 - (97.4 * overallProgress() / 100)"/>
            </svg>
            <span class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700">{{ overallProgress() }}%</span>
          </div>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-5">

        <!-- ─── Video Area ─── -->
        <div class="flex-1 min-w-0 space-y-4">
          <div class="relative bg-[#0a0a0a] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-1 ring-white/5">
            @if (currentLesson()) {
              <video
                #videoPlayer
                class="w-full aspect-video"
                [src]="currentLesson()!.video_url"
                (timeupdate)="onTimeUpdate($event)"
                (ended)="onVideoEnded()"
                (loadedmetadata)="onVideoLoaded($event)"
                (play)="isPlaying.set(true)"
                (pause)="isPlaying.set(false)"
                controls
                controlsList="nodownload"
                preload="metadata"
              ></video>

              <!-- Auto-advance Overlay -->
              @if (showNextOverlay()) {
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-10">
                  <div class="text-center text-white space-y-3">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mb-2">
                      <svg class="h-8 w-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                    </div>
                    <p class="text-sm font-medium text-white/80">Lesson completed!</p>
                    @if (nextLesson()) {
                      <p class="text-lg font-bold">Up next: {{ nextLesson()!.title_en || nextLesson()!.title }}</p>
                      <p class="text-xs text-white/50">Starting in a moment...</p>
                    } @else {
                      <p class="text-lg font-bold">Workshop completed!</p>
                      <a routerLink="/dashboard" class="inline-flex items-center gap-2 mt-2 px-5 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors">
                        Back to Dashboard
                      </a>
                    }
                  </div>
                </div>
              }
            } @else {
              <div class="w-full aspect-video flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
                <div class="text-center space-y-3">
                  <div class="w-16 h-16 mx-auto rounded-full bg-white/5 flex items-center justify-center">
                    <svg class="h-8 w-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/></svg>
                  </div>
                  <p class="text-sm text-white/40">Select a lesson to begin</p>
                </div>
              </div>
            }
          </div>

          <!-- ─── Lesson Details Card ─── -->
          @if (currentLesson(); as lesson) {
            <div class="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div class="space-y-1 min-w-0">
                  <div class="flex items-center gap-2.5">
                    <span class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">{{ currentLessonIndex() + 1 }}</span>
                    <h2 class="text-base font-semibold text-slate-900 truncate">{{ lesson.title_en || lesson.title }}</h2>
                  </div>
                  @if (lesson.description) {
                    <p class="text-sm text-slate-500 leading-relaxed pl-[38px]">{{ lesson.description }}</p>
                  }
                </div>
                <div class="shrink-0 flex items-center gap-2">
                  @if (lesson.duration_seconds) {
                    <span class="text-xs text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">{{ formatDuration(lesson.duration_seconds) }}</span>
                  }
                  @if (lesson.progress?.completed) {
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      Done
                    </span>
                  }
                </div>
              </div>

              <!-- Nav Buttons -->
              <div class="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <button (click)="goToPrevLesson()" [disabled]="currentLessonIndex() === 0"
                        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                  Previous
                </button>
                <span class="text-xs text-slate-400">{{ currentLessonIndex() + 1 }} of {{ lessons().length }}</span>
                <button (click)="goToNextLesson()" [disabled]="currentLessonIndex() >= lessons().length - 1"
                        class="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  Next
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- ─── Sidebar ─── -->
        <div class="lg:w-[340px] shrink-0">
          <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm sticky top-20">
            <!-- Sidebar Header -->
            <div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div class="flex items-center justify-between">
                <h3 class="text-sm font-bold text-slate-800">Course Content</h3>
                <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      [class.bg-emerald-50]="completedCount() === lessons().length"
                      [class.text-emerald-700]="completedCount() === lessons().length"
                      [class.bg-brand-50]="completedCount() !== lessons().length"
                      [class.text-brand-700]="completedCount() !== lessons().length">
                  {{ completedCount() }}/{{ lessons().length }}
                </span>
              </div>
              <!-- Mini Progress Bar -->
              <div class="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700 ease-out"
                     [class.bg-emerald-500]="overallProgress() === 100"
                     [class.bg-brand-500]="overallProgress() < 100"
                     [style.width.%]="overallProgress()"></div>
              </div>
            </div>

            <!-- Lessons List -->
            <div class="max-h-[calc(100vh-14rem)] overflow-y-auto">
              @for (lesson of lessons(); track lesson.id; let i = $index) {
                <button
                  type="button"
                  (click)="selectLesson(lesson)"
                  class="w-full text-left px-5 py-3.5 flex items-start gap-3.5 transition-all duration-200 border-l-[3px] hover:bg-slate-50"
                  [class.bg-brand-50]="currentLesson()?.id === lesson.id"
                  [class.border-l-brand-600]="currentLesson()?.id === lesson.id"
                  [class.border-l-transparent]="currentLesson()?.id !== lesson.id"
                >
                  <!-- Status Icon -->
                  <div class="shrink-0 mt-0.5">
                    @if (lesson.progress?.completed) {
                      <div class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                        <svg class="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                      </div>
                    } @else if (currentLesson()?.id === lesson.id) {
                      <div class="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center shadow-sm shadow-brand-200 animate-pulse">
                        <svg class="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M6 4l12 6-12 6V4z"/></svg>
                      </div>
                    } @else {
                      <div class="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-400 group-hover:border-slate-300">
                        {{ i + 1 }}
                      </div>
                    }
                  </div>

                  <!-- Info -->
                  <div class="min-w-0 flex-1">
                    <span class="block text-[13px] font-medium leading-snug"
                       [class.text-brand-700]="currentLesson()?.id === lesson.id"
                       [class.text-slate-800]="currentLesson()?.id !== lesson.id && !lesson.progress?.completed"
                       [class.text-slate-500]="lesson.progress?.completed && currentLesson()?.id !== lesson.id">
                      {{ lesson.title_en || lesson.title }}
                    </span>
                    <div class="flex items-center gap-2 mt-1">
                      @if (lesson.duration_seconds) {
                        <span class="inline-flex items-center gap-1 text-[11px] text-slate-400">
                          <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                          {{ formatDuration(lesson.duration_seconds) }}
                        </span>
                      }
                      @if (lesson.is_preview) {
                        <span class="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md tracking-wide">FREE</span>
                      }
                    </div>
                  </div>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class WorkshopPlayerComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayerRef?: ElementRef<HTMLVideoElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private learnService = inject(LearnService);

  workshop = signal<WorkshopDetail | null>(null);
  currentLesson = signal<Lesson | null>(null);
  loading = signal(true);
  isPlaying = signal(false);
  showNextOverlay = signal(false);

  lessons = computed(() => this.workshop()?.lessons ?? []);
  completedCount = computed(() => this.lessons().filter(l => l.progress?.completed).length);
  overallProgress = computed(() => {
    const total = this.lessons().length;
    return total > 0 ? Math.round((this.completedCount() / total) * 100) : 0;
  });
  currentLessonIndex = computed(() => {
    const cur = this.currentLesson();
    return cur ? this.lessons().findIndex(l => l.id === cur.id) : -1;
  });
  nextLesson = computed(() => {
    const idx = this.currentLessonIndex();
    const all = this.lessons();
    return idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null;
  });

  private progressSubject = new Subject<{ lessonId: number; seconds: number }>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    const eventId = Number(this.route.snapshot.paramMap.get('eventId'));

    this.learnService.getWorkshopDetail(eventId).subscribe({
      next: ({ data }) => {
        this.workshop.set(data);
        const firstUnwatched = data.lessons.find(l => !l.progress?.completed) ?? data.lessons[0];
        if (firstUnwatched) this.selectLesson(firstUnwatched);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
    });

    this.progressSubject.pipe(
      debounceTime(5000),
      takeUntil(this.destroy$)
    ).subscribe(({ lessonId, seconds }) => {
      this.learnService.updateProgress(lessonId, seconds, false).subscribe();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  selectLesson(lesson: Lesson): void {
    this.showNextOverlay.set(false);
    this.currentLesson.set(lesson);
    const video = this.videoPlayerRef?.nativeElement;
    if (video) {
      video.load();
      if (lesson.progress?.watched_seconds && lesson.progress.watched_seconds > 5) {
        video.currentTime = lesson.progress.watched_seconds - 3;
      }
    }
  }

  onVideoLoaded(event: Event): void {
    const video = event.target as HTMLVideoElement;
    const lesson = this.currentLesson();
    if (lesson?.progress?.watched_seconds && lesson.progress.watched_seconds > 5) {
      video.currentTime = lesson.progress.watched_seconds - 3;
    }
  }

  onTimeUpdate(event: Event): void {
    const video = event.target as HTMLVideoElement;
    const lesson = this.currentLesson();
    if (!lesson) return;
    this.progressSubject.next({ lessonId: lesson.id, seconds: Math.floor(video.currentTime) });
  }

  onVideoEnded(): void {
    const lesson = this.currentLesson();
    if (!lesson) return;

    this.showNextOverlay.set(true);

    this.learnService.updateProgress(lesson.id, lesson.duration_seconds ?? 0, true).subscribe(() => {
      const lessons = this.lessons();
      const updated = lessons.map(l =>
        l.id === lesson.id ? { ...l, progress: { watched_seconds: l.duration_seconds ?? 0, completed: true } } : l
      );
      this.workshop.update(ws => ws ? { ...ws, lessons: updated } : ws);
      this.currentLesson.update(l => l ? { ...l, progress: { watched_seconds: l.duration_seconds ?? 0, completed: true } } : l);

      const next = this.nextLesson();
      if (next) {
        setTimeout(() => this.selectLesson(next), 2500);
      }
    });
  }

  goToPrevLesson(): void {
    const idx = this.currentLessonIndex();
    if (idx > 0) this.selectLesson(this.lessons()[idx - 1]);
  }

  goToNextLesson(): void {
    const next = this.nextLesson();
    if (next) this.selectLesson(next);
  }

  formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}
