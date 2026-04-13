<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LearnController extends Controller
{
    public function myWorkshops(): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollments = Enrollment::with(['event' => fn ($q) => $q->withCount('lessons')])
            ->where('user_id', $userId)
            ->latest('enrolled_at')
            ->get();

        $eventIds = $enrollments->pluck('event_id')->filter();

        $completedByEvent = [];
        if ($eventIds->isNotEmpty()) {
            $completedByEvent = LessonProgress::where('user_id', $userId)
                ->where('completed', true)
                ->whereHas('lesson', fn ($q) => $q->whereIn('event_id', $eventIds))
                ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
                ->selectRaw('lessons.event_id, COUNT(*) as cnt')
                ->groupBy('lessons.event_id')
                ->pluck('cnt', 'event_id')
                ->toArray();
        }

        $data = $enrollments->map(function (Enrollment $e) use ($completedByEvent) {
            $event = $e->event;
            if (! $event) {
                return null;
            }

            $totalLessons = $event->lessons_count ?? 0;
            $completedLessons = (int) ($completedByEvent[$event->id] ?? 0);
            $progress = $totalLessons > 0 ? round(($completedLessons / $totalLessons) * 100) : 0;

            return [
                'id' => $e->id,
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'title_en' => $event->title_en,
                    'slug' => $event->slug,
                    'image_url' => $event->image_url,
                    'summary' => $event->summary,
                    'summary_en' => $event->summary_en,
                ],
                'lessons_count' => $totalLessons,
                'completed_lessons_count' => $completedLessons,
                'progress_percent' => $progress,
                'enrolled_at' => $e->enrolled_at->toIso8601String(),
                'completed_at' => $e->completed_at?->toIso8601String(),
            ];
        })->filter()->values();

        return response()->json(['data' => $data]);
    }

    public function workshopDetail(int $id): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $enrollment = Enrollment::where('user_id', $userId)
            ->where('event_id', $id)
            ->firstOrFail();

        $event = $enrollment->event;
        $event->load(['lessons' => fn ($q) => $q->orderBy('sort_order')]);

        $progressMap = LessonProgress::where('user_id', $userId)
            ->whereIn('lesson_id', $event->lessons->pluck('id'))
            ->get()
            ->keyBy('lesson_id');

        $lessons = $event->lessons->map(fn ($lesson) => [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'title_en' => $lesson->title_en,
            'description' => $lesson->description,
            'video_url' => $lesson->video_url,
            'duration_seconds' => $lesson->duration_seconds,
            'sort_order' => $lesson->sort_order,
            'is_preview' => $lesson->is_preview,
            'progress' => $progressMap->has($lesson->id) ? [
                'watched_seconds' => $progressMap[$lesson->id]->watched_seconds,
                'completed' => $progressMap[$lesson->id]->completed,
            ] : null,
        ]);

        return response()->json([
            'data' => [
                'event' => [
                    'id' => $event->id,
                    'title' => $event->title,
                    'title_en' => $event->title_en,
                    'slug' => $event->slug,
                    'image_url' => $event->image_url,
                    'description' => $event->description,
                    'summary' => $event->summary,
                    'summary_en' => $event->summary_en,
                ],
                'lessons' => $lessons,
                'enrolled_at' => $enrollment->enrolled_at->toIso8601String(),
            ],
        ]);
    }

    public function updateProgress(Request $request): JsonResponse
    {
        $userId = Auth::guard('api')->id();

        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'watched_seconds' => 'required|integer|min:0',
            'completed' => 'required|boolean',
        ]);

        $lesson = Lesson::findOrFail($validated['lesson_id']);

        Enrollment::where('user_id', $userId)
            ->where('event_id', $lesson->event_id)
            ->firstOrFail();

        $progress = LessonProgress::updateOrCreate(
            ['user_id' => $userId, 'lesson_id' => $validated['lesson_id']],
            [
                'watched_seconds' => $validated['watched_seconds'],
                'completed' => $validated['completed'],
                'last_watched_at' => now(),
            ]
        );

        return response()->json(['data' => $progress]);
    }
}
