<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($q = $request->query('q')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        $users = $query->latest()->paginate($perPage);

        return response()->json($users);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        return response()->json(['data' => $this->serializeUser($user)]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'phone' => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|url|max:500',
        ]);

        $user->update($validated);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'user.updated',
            'User',
            $user->id,
            ['changes' => array_keys($validated)]
        );

        return response()->json(['data' => $this->serializeUser($user->fresh())]);
    }

    public function toggleActive(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $admin = Auth::guard('api')->user();

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'Cannot deactivate your own account.'], 422);
        }

        $user->update(['is_active' => ! $user->is_active]);

        ActivityLog::record(
            $admin->id,
            $user->is_active ? 'user.activated' : 'user.deactivated',
            'User',
            $user->id
        );

        return response()->json(['data' => $this->serializeUser($user->fresh())]);
    }

    public function changeRole(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $admin = Auth::guard('api')->user();

        if ($user->id === $admin->id) {
            return response()->json(['message' => 'Cannot change your own role.'], 422);
        }

        $validated = $request->validate([
            'role' => ['required', Rule::in(['admin', 'moderator', 'user'])],
        ]);

        $oldRole = $user->role;
        $user->update(['role' => $validated['role']]);

        ActivityLog::record(
            $admin->id,
            'user.role_changed',
            'User',
            $user->id,
            ['from' => $oldRole, 'to' => $validated['role']]
        );

        return response()->json(['data' => $this->serializeUser($user->fresh())]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'is_active' => $user->is_active,
            'email_verified_at' => $user->email_verified_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at->toIso8601String(),
            'updated_at' => $user->updated_at->toIso8601String(),
        ];
    }
}
