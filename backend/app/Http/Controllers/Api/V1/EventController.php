<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $q = Event::query()->published();

        if ($request->boolean('featured')) {
            $q->where('is_featured', true);
        }

        if ($search = $request->query('q')) {
            $q->where(function ($sub) use ($search) {
                $sub->where('title', 'like', '%'.$search.'%')
                    ->orWhere('summary', 'like', '%'.$search.'%');
            });
        }

        $events = $q
            ->orderByDesc('is_featured')
            ->orderBy('starts_at')
            ->paginate(min((int) $request->query('per_page', 24), 100));

        return response()->json($events);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::query()->published()->where('slug', $slug)->firstOrFail();

        return response()->json($event);
    }
}
