<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ValidateTokenVersion
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::guard('api')->user();

        if ($user) {
            $payload = Auth::guard('api')->payload();
            $tokenVersion = $payload->get('tv', 0);

            if ((int) $tokenVersion !== (int) ($user->token_version ?? 0)) {
                Auth::guard('api')->logout();

                return response()->json(['message' => 'Session expired. Please login again.'], 401);
            }
        }

        return $next($request);
    }
}
