<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Mail\ForgotPasswordOtpMail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password;
use Throwable;

class LearnerAuthController extends Controller
{
    private const OTP_CACHE_PREFIX = 'learner_pwd_otp:';

    private const OTP_TTL_MINUTES = 15;

    /** Same response whether or not a learner account exists (avoid email enumeration). */
    private function forgotRequestMessage(Request $request): string
    {
        $al = strtolower((string) $request->header('Accept-Language', 'en'));

        if (str_contains($al, 'ar')) {
            return 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فقد أرسلنا رمز التحقق.';
        }

        return 'If an account exists for this email, we sent a verification code.';
    }

    public function forgotPasswordRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $emailNorm = strtolower(trim($validated['email']));

        $user = User::query()
            ->whereRaw('lower(email) = ?', [$emailNorm])
            ->where('role', 'user')
            ->where('is_active', true)
            ->first();

        if ($user !== null) {
            $otp = (string) random_int(100000, 999999);
            $cacheKey = self::OTP_CACHE_PREFIX.$emailNorm;

            Cache::put($cacheKey, Hash::make($otp), now()->addMinutes(self::OTP_TTL_MINUTES));

            try {
                Mail::to($user->email)->send(new ForgotPasswordOtpMail($otp, $user));
            } catch (Throwable $e) {
                Cache::forget($cacheKey);
                Log::error('Forgot password OTP email failed', [
                    'email' => $user->email,
                    'exception' => $e->getMessage(),
                ]);

                return response()->json([
                    'message' => 'Unable to send email. Please try again later.',
                ], 503);
            }
        }

        return response()->json(['message' => $this->forgotRequestMessage($request)]);
    }

    public function forgotPasswordReset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'string', 'size:6', 'regex:/^[0-9]{6}$/'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $emailNorm = strtolower(trim($validated['email']));
        $cacheKey = self::OTP_CACHE_PREFIX.$emailNorm;
        $hashedOtp = Cache::get($cacheKey);

        if (! is_string($hashedOtp) || $hashedOtp === '' || ! Hash::check($validated['otp'], $hashedOtp)) {
            return response()->json(['message' => 'Invalid or expired verification code.'], 422);
        }

        $user = User::query()
            ->whereRaw('lower(email) = ?', [$emailNorm])
            ->where('role', 'user')
            ->where('is_active', true)
            ->first();

        if ($user === null) {
            Cache::forget($cacheKey);

            return response()->json(['message' => 'Invalid or expired verification code.'], 422);
        }

        $user->update([
            'password' => $validated['password'],
        ]);
        $user->increment('token_version');
        Cache::forget($cacheKey);

        return response()->json(['message' => 'Password reset successfully. You can sign in now.']);
    }

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

        if (! $user->is_active) {
            Auth::guard('api')->logout();

            return response()->json(['message' => 'Account deactivated.'], 403);
        }

        $user->increment('token_version');
        $user->update(['last_login_at' => now()]);
        $user->refresh();

        $token = Auth::guard('api')->login($user);

        return $this->respondWithToken($token, $user);
    }

    public function logout(): JsonResponse
    {
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
            'created_at' => $user->created_at->toIso8601String(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:30',
            'avatar_url' => 'sometimes|nullable|url|max:500',
        ]);

        $user->update($validated);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar_url,
            'is_active' => $user->is_active,
            'created_at' => $user->created_at->toIso8601String(),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = Auth::guard('api')->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update([
            'password' => $validated['password'],
        ]);

        return response()->json(['message' => 'Password updated successfully.']);
    }

    private function respondWithToken(string $token, $user, int $status = 200): JsonResponse
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
        ], $status);
    }
}
