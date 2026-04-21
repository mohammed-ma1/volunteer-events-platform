<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $token = Auth::guard('api')->attempt($credentials);

        if (! $token) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = Auth::guard('api')->user();

        if (! $user->hasAdminAccess()) {
            Auth::guard('api')->logout();

            return response()->json(['message' => 'Insufficient privileges.'], 403);
        }

        if (! $user->is_active) {
            Auth::guard('api')->logout();

            return response()->json(['message' => 'Account deactivated.'], 403);
        }

        $user->update(['last_login_at' => now()]);

        ActivityLog::record($user->id, 'auth.login');

        return $this->respondWithToken($token, $user);
    }

    public function logout(): JsonResponse
    {
        $user = Auth::guard('api')->user();

        if ($user) {
            ActivityLog::record($user->id, 'auth.logout');
        }

        Auth::guard('api')->logout();

        return response()->json(['message' => 'Logged out.']);
    }

    public function refresh(): JsonResponse
    {
        $token = Auth::guard('api')->refresh();
        $user = Auth::guard('api')->user();

        return $this->respondWithToken($token, $user);
    }

    public function me(): JsonResponse
    {
        $user = Auth::guard('api')->user();

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'created_at' => $user->created_at->toIso8601String(),
        ]);
    }

    private function respondWithToken(string $token, $user): JsonResponse
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }
}
