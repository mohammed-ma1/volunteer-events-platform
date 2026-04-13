<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class EnsureCartToken
{
    public const HEADER = 'X-Cart-Token';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header(self::HEADER);
        if (! is_string($token) || $token === '') {
            Log::warning('Cart middleware: missing token header', ['url' => $request->fullUrl()]);

            return response()->json(['message' => 'Missing cart token.'], 401);
        }

        $cart = Cart::query()->where('token', $token)->first();
        if (! $cart) {
            Log::warning('Cart middleware: token not found in DB', ['token' => $token, 'url' => $request->fullUrl()]);

            return response()->json(['message' => 'Cart not found.'], 404);
        }

        $request->attributes->set('cart', $cart);

        return $next($request);
    }
}
