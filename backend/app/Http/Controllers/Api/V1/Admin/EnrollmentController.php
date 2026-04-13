<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\Event;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnrollmentController extends Controller
{
    public function index(int $eventId): JsonResponse
    {
        Event::findOrFail($eventId);

        $enrollments = Enrollment::with('user:id,name,email,avatar_url')
            ->where('event_id', $eventId)
            ->latest('enrolled_at')
            ->get()
            ->map(fn (Enrollment $e) => [
                'id' => $e->id,
                'user' => $e->user ? [
                    'id' => $e->user->id,
                    'name' => $e->user->name,
                    'email' => $e->user->email,
                    'avatar_url' => $e->user->avatar_url,
                ] : null,
                'enrolled_at' => $e->enrolled_at->toIso8601String(),
                'completed_at' => $e->completed_at?->toIso8601String(),
            ]);

        return response()->json(['data' => $enrollments]);
    }

    public function store(Request $request, int $eventId): JsonResponse
    {
        $event = Event::findOrFail($eventId);

        $validated = $request->validate([
            'user_id' => 'required_without:email|nullable|exists:users,id',
            'email' => 'required_without:user_id|nullable|email',
        ]);

        if (! empty($validated['user_id'])) {
            $user = User::findOrFail($validated['user_id']);
        } else {
            $user = User::where('email', $validated['email'])->first();
            if (! $user) {
                return response()->json(['message' => 'No user found with this email.'], 422);
            }
        }

        $existing = Enrollment::where('user_id', $user->id)->where('event_id', $event->id)->first();
        if ($existing) {
            return response()->json(['message' => 'User is already enrolled.'], 422);
        }

        $enrollment = Enrollment::create([
            'user_id' => $user->id,
            'event_id' => $event->id,
            'enrolled_at' => now(),
        ]);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'enrollment.created',
            'Enrollment',
            $enrollment->id,
            ['user_name' => $user->name, 'event_title' => $event->title_en ?? $event->title]
        );

        return response()->json([
            'data' => [
                'id' => $enrollment->id,
                'user' => ['id' => $user->id, 'name' => $user->name, 'email' => $user->email],
                'enrolled_at' => $enrollment->enrolled_at->toIso8601String(),
            ],
        ], 201);
    }

    public function destroy(int $eventId, int $enrollmentId): JsonResponse
    {
        Event::findOrFail($eventId);
        $enrollment = Enrollment::with('user:id,name')
            ->where('event_id', $eventId)
            ->findOrFail($enrollmentId);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'enrollment.removed',
            'Enrollment',
            $enrollment->id,
            ['user_name' => $enrollment->user?->name]
        );

        $enrollment->delete();

        return response()->json(null, 204);
    }
}
