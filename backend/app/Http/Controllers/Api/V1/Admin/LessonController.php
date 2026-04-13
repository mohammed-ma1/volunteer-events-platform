<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Event;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LessonController extends Controller
{
    public function index(int $eventId): JsonResponse
    {
        $event = Event::findOrFail($eventId);

        $lessons = $event->lessons()->orderBy('sort_order')->get();

        return response()->json(['data' => $lessons]);
    }

    public function store(Request $request, int $eventId): JsonResponse
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'title_en' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'video_url' => 'required|string|max:500',
            'duration_seconds' => 'nullable|integer|min:0',
            'sort_order' => 'nullable|integer|min:0',
            'is_preview' => 'nullable|boolean',
        ]);

        $validated['event_id'] = $event->id;
        $validated['sort_order'] = $validated['sort_order'] ?? ($event->lessons()->max('sort_order') + 1);

        $lesson = Lesson::create($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'lesson.created',
            'Lesson',
            $lesson->id,
            ['event_id' => $event->id, 'title' => $lesson->title]
        );

        return response()->json(['data' => $lesson], 201);
    }

    public function update(Request $request, int $eventId, int $lessonId): JsonResponse
    {
        Event::findOrFail($eventId);
        $lesson = Lesson::where('event_id', $eventId)->findOrFail($lessonId);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'title_en' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'video_url' => 'sometimes|string|max:500',
            'duration_seconds' => 'sometimes|nullable|integer|min:0',
            'sort_order' => 'sometimes|integer|min:0',
            'is_preview' => 'sometimes|boolean',
        ]);

        $lesson->update($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'lesson.updated',
            'Lesson',
            $lesson->id,
            ['changes' => array_keys($validated)]
        );

        return response()->json(['data' => $lesson->fresh()]);
    }

    public function destroy(int $eventId, int $lessonId): JsonResponse
    {
        Event::findOrFail($eventId);
        $lesson = Lesson::where('event_id', $eventId)->findOrFail($lessonId);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'lesson.deleted',
            'Lesson',
            $lesson->id,
            ['title' => $lesson->title]
        );

        $lesson->delete();

        return response()->json(null, 204);
    }
}
