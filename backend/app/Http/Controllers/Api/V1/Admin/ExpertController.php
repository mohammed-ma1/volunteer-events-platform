<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Expert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class ExpertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Expert::query()->withCount('events as workshops_count');

        if ($q = $request->query('q')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($specialization = $request->query('specialization')) {
            $query->where('specialization', $specialization);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        $experts = $query->latest()->paginate($perPage);

        return response()->json($experts);
    }

    public function show(int $id): JsonResponse
    {
        $expert = Expert::withCount('events as workshops_count')->findOrFail($id);

        return response()->json(['data' => $expert]);
    }

    /**
     * Distinct specialization values currently in use. Consumed by the admin
     * portal to populate autocomplete/filter dropdowns.
     */
    public function specializations(): JsonResponse
    {
        $values = Expert::query()
            ->whereNotNull('specialization')
            ->where('specialization', '!=', '')
            ->distinct()
            ->orderBy('specialization')
            ->pluck('specialization')
            ->values();

        return response()->json(['data' => $values]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:experts',
            'phone' => 'nullable|string|max:30',
            'avatar_url' => 'nullable|url|max:500',
            'bio' => 'nullable|string',
            'specialization' => 'required|string|max:60',
            'title' => 'nullable|string|max:255',
        ]);

        $expert = Expert::create($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'expert.created',
            'Expert',
            $expert->id,
            ['name' => $expert->name]
        );

        return response()->json([
            'data' => $expert->loadCount('events as workshops_count'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $expert = Expert::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('experts')->ignore($expert->id)],
            'phone' => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|url|max:500',
            'bio' => 'sometimes|nullable|string',
            'specialization' => 'sometimes|string|max:60',
            'title' => 'sometimes|nullable|string|max:255',
        ]);

        $expert->update($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'expert.updated',
            'Expert',
            $expert->id,
            ['changes' => array_keys($validated)]
        );

        return response()->json([
            'data' => $expert->fresh()->loadCount('events as workshops_count'),
        ]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $expert = Expert::findOrFail($id);

        $expert->update(['is_active' => ! $expert->is_active]);

        ActivityLog::record(
            Auth::guard('api')->id(),
            $expert->is_active ? 'expert.activated' : 'expert.deactivated',
            'Expert',
            $expert->id
        );

        return response()->json([
            'data' => $expert->fresh()->loadCount('events as workshops_count'),
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $expert = Expert::findOrFail($id);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'expert.deleted',
            'Expert',
            $expert->id,
            ['name' => $expert->name]
        );

        $expert->delete();

        return response()->json(null, 204);
    }
}
