<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Create a learner account (role user). Omit password to receive a generated one in the response.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'sometimes|nullable|string|max:30',
            'password' => 'sometimes|nullable|string|min:8|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $provided = $validated['password'] ?? null;
        $plainPassword = is_string($provided) && strlen($provided) >= 8
            ? $provided
            : Str::password(14);
        $passwordWasGenerated = ! is_string($provided) || strlen($provided) < 8;

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $plainPassword,
            'role' => 'user',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'user.created',
            'User',
            $user->id,
            ['email' => $user->email, 'auto_password' => $passwordWasGenerated]
        );

        return response()->json([
            'data' => $this->serializeUser($user),
            'meta' => [
                'temporary_password' => $passwordWasGenerated ? $plainPassword : null,
            ],
        ], 201);
    }

    /**
     * Move all enrollments from this learner to another (e.g. wrong-email checkout). Duplicate events on the target are deduplicated.
     */
    public function transferEnrollments(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'target_user_id' => 'required|integer|exists:users,id',
        ]);

        $source = User::findOrFail($id);
        $target = User::findOrFail($validated['target_user_id']);

        if ($source->id === $target->id) {
            return response()->json(['message' => 'Source and target users must be different.'], 422);
        }

        if ($source->role !== 'user' || $target->role !== 'user') {
            return response()->json(['message' => 'Enrollment transfer is only allowed between learner (user) accounts.'], 422);
        }

        $moved = 0;
        $mergedDuplicates = 0;

        DB::transaction(function () use ($source, $target, &$moved, &$mergedDuplicates): void {
            $enrollments = Enrollment::query()
                ->where('user_id', $source->id)
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            foreach ($enrollments as $enrollment) {
                $existingOnTarget = Enrollment::query()
                    ->where('user_id', $target->id)
                    ->where('event_id', $enrollment->event_id)
                    ->lockForUpdate()
                    ->first();

                if ($existingOnTarget !== null) {
                    $enrollment->delete();
                    $mergedDuplicates++;

                    continue;
                }

                $enrollment->update(['user_id' => $target->id]);
                $moved++;
            }
        });

        ActivityLog::record(
            Auth::guard('api')->id(),
            'user.enrollments_transferred',
            'User',
            $target->id,
            [
                'from_user_id' => $source->id,
                'to_user_id' => $target->id,
                'moved' => $moved,
                'merged_duplicates' => $mergedDuplicates,
            ]
        );

        return response()->json([
            'data' => [
                'from_user_id' => $source->id,
                'to_user_id' => $target->id,
                'moved' => $moved,
                'merged_duplicates' => $mergedDuplicates,
            ],
        ]);
    }

    /**
     * Set a new password for a learner (invalidates existing JWTs). Omit password to auto-generate; copy from response once.
     */
    public function resetPassword(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->role !== 'user') {
            return response()->json(['message' => 'This endpoint only resets passwords for learner accounts.'], 422);
        }

        $admin = Auth::guard('api')->user();
        if ($user->id === $admin->id) {
            return response()->json(['message' => 'Use your account profile to change your own password.'], 422);
        }

        $validated = $request->validate([
            'password' => 'sometimes|nullable|string|min:8|max:255',
        ]);

        $provided = $validated['password'] ?? null;
        $plainPassword = is_string($provided) && strlen($provided) >= 8
            ? $provided
            : Str::password(14);
        $passwordWasGenerated = ! is_string($provided) || strlen($provided) < 8;

        $user->password = $plainPassword;
        $user->save();
        $user->increment('token_version');

        ActivityLog::record(
            $admin->id,
            'user.password_reset_by_admin',
            'User',
            $user->id,
            ['auto_password' => $passwordWasGenerated]
        );

        return response()->json([
            'data' => $this->serializeUser($user->fresh()),
            'meta' => [
                'temporary_password' => $passwordWasGenerated ? $plainPassword : null,
            ],
        ]);
    }

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
