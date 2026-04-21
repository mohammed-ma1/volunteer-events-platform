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
                    ->orWhere('title_en', 'like', '%'.$search.'%')
                    ->orWhere('summary', 'like', '%'.$search.'%')
                    ->orWhere('summary_en', 'like', '%'.$search.'%')
                    ->orWhere('description', 'like', '%'.$search.'%')
                    ->orWhere('description_en', 'like', '%'.$search.'%');
            });
        }

        $events = $q
            ->orderByDesc('is_featured')
            ->orderBy('starts_at')
            ->paginate(min((int) $request->query('per_page', 24), 200));

        return response()->json($events);
    }

    public function show(string $slug): JsonResponse
    {
        $event = Event::query()->published()->where('slug', $slug)->firstOrFail();

        return response()->json($event);
    }
}
