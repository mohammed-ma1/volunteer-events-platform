<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Event::query();

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->query('q')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('title', 'like', "%{$q}%")
                    ->orWhere('title_en', 'like', "%{$q}%")
                    ->orWhere('summary', 'like', "%{$q}%")
                    ->orWhere('summary_en', 'like', "%{$q}%");
            });
        }

        if ($request->has('is_featured')) {
            $query->where('is_featured', filter_var($request->query('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        $events = $query->with('creator:id,name')
            ->latest()
            ->paginate($perPage);

        return response()->json($events);
    }

    public function show(int $id): JsonResponse
    {
        $event = Event::with(['creator:id,name', 'approver:id,name'])->findOrFail($id);

        return response()->json(['data' => $event]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateEvent($request);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['title_en'] ?? $validated['title']);
        $validated['created_by'] = Auth::guard('api')->id();
        $validated['status'] = $validated['status'] ?? Event::STATUS_DRAFT;

        if ($validated['status'] === Event::STATUS_PUBLISHED) {
            $validated['is_published'] = true;
        }

        $event = Event::create($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'event.created',
            'Event',
            $event->id,
            ['title' => $event->title_en ?? $event->title]
        );

        return response()->json(['data' => $event->load('creator:id,name')], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $this->validateEvent($request, $event->id);

        if (isset($validated['title']) || isset($validated['title_en'])) {
            $base = $validated['title_en'] ?? $validated['title'] ?? $event->title;
            $validated['slug'] = $validated['slug'] ?? Str::slug($base);
        }

        $event->update($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'event.updated',
            'Event',
            $event->id,
            ['changes' => array_keys($validated)]
        );

        return response()->json(['data' => $event->fresh()->load('creator:id,name')]);
    }

    public function destroy(int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'event.deleted',
            'Event',
            $event->id,
            ['title' => $event->title_en ?? $event->title]
        );

        $event->delete();

        return response()->json(null, 204);
    }

    public function changeStatus(Request $request, int $id): JsonResponse
    {
        $event = Event::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                Event::STATUS_DRAFT,
                Event::STATUS_PENDING_REVIEW,
                Event::STATUS_PUBLISHED,
                Event::STATUS_ARCHIVED,
            ])],
        ]);

        $oldStatus = $event->status;
        $event->status = $validated['status'];

        if ($validated['status'] === Event::STATUS_PUBLISHED) {
            $event->is_published = true;
            $event->approved_by = Auth::guard('api')->id();
            $event->approved_at = now();
        } elseif ($validated['status'] === Event::STATUS_ARCHIVED) {
            $event->is_published = false;
        }

        $event->save();

        ActivityLog::record(
            Auth::guard('api')->id(),
            'event.status_changed',
            'Event',
            $event->id,
            ['from' => $oldStatus, 'to' => $validated['status']]
        );

        return response()->json(['data' => $event->fresh()->load(['creator:id,name', 'approver:id,name'])]);
    }

    private function validateEvent(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'title_en' => 'sometimes|nullable|string|max:255',
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', Rule::unique('events')->ignore($ignoreId)],
            'summary' => 'sometimes|nullable|string|max:1000',
            'summary_en' => 'sometimes|nullable|string|max:1000',
            'description' => 'sometimes|nullable|string',
            'description_en' => 'sometimes|nullable|string',
            'image_url' => 'sometimes|nullable|url|max:500',
            'starts_at' => 'sometimes|required|date',
            'ends_at' => 'sometimes|required|date|after:starts_at',
            'location' => 'sometimes|nullable|string|max:255',
            'location_en' => 'sometimes|nullable|string|max:255',
            'zoom_link' => 'sometimes|nullable|string|max:500',
            'price' => 'sometimes|required|numeric|min:0',
            'currency' => 'sometimes|string|size:3',
            'capacity' => 'sometimes|nullable|integer|min:1',
            'is_featured' => 'sometimes|boolean',
            'status' => ['sometimes', Rule::in([
                Event::STATUS_DRAFT,
                Event::STATUS_PENDING_REVIEW,
                Event::STATUS_PUBLISHED,
                Event::STATUS_ARCHIVED,
            ])],
        ]);
    }

    /**
     * Apply one Zoom link (or clear it) to many workshops at once.
     *
     * Body:
     *   zoom_link:  string|null  — null or "" clears the link on matched rows.
     *   overwrite:  bool         — when false, only rows without a zoom_link are touched.
     *   scope:      'all' | 'workshops_only'  — 'workshops_only' (default) excludes
     *               package bundle rows so the link only lands on live sessions.
     */
    public function bulkSetZoomLink(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'zoom_link' => 'nullable|string|max:500',
            'overwrite' => 'sometimes|boolean',
            'scope' => ['sometimes', Rule::in(['all', 'workshops_only'])],
        ]);

        $zoomLink = isset($validated['zoom_link']) && $validated['zoom_link'] !== ''
            ? $validated['zoom_link']
            : null;
        $overwrite = (bool) ($validated['overwrite'] ?? false);
        $scope = $validated['scope'] ?? 'workshops_only';

        $query = Event::query();

        if ($scope === 'workshops_only') {
            $query->whereNotIn('slug', Event::ALL_PACKAGE_SLUGS);
        }

        if (! $overwrite && $zoomLink !== null) {
            $query->where(function ($q) {
                $q->whereNull('zoom_link')->orWhere('zoom_link', '');
            });
        }

        $matched = (clone $query)->count();
        $updated = $query->update(['zoom_link' => $zoomLink]);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'event.bulk_zoom_link',
            'Event',
            null,
            [
                'scope' => $scope,
                'overwrite' => $overwrite,
                'matched' => $matched,
                'updated' => $updated,
                'link_set' => $zoomLink !== null,
            ]
        );

        return response()->json([
            'data' => [
                'matched' => $matched,
                'updated' => $updated,
                'zoom_link' => $zoomLink,
                'overwrite' => $overwrite,
                'scope' => $scope,
            ],
        ]);
    }
}
