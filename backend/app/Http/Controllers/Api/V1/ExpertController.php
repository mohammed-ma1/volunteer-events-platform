<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Public, read-only experts feed consumed by the events-platform home page so
 * admin-portal avatar/bio edits flow through to the public site without a
 * frontend rebuild. Inactive experts are hidden.
 */
class ExpertController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 100), 200);

        $experts = Expert::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->paginate($perPage)
            ->through(fn (Expert $e) => [
                'id' => $e->id,
                'name' => $e->name,
                'avatar_url' => $e->avatar_url,
                'bio' => $e->bio,
                'specialization' => $e->specialization,
                'title' => $e->title,
            ]);

        return response()->json($experts);
    }
}
