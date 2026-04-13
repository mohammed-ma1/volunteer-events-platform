<?php

namespace App\Http\Middleware;

use App\Models\Cart;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCartToken
{
    public const HEADER = 'X-Cart-Token';

    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->header(self::HEADER);
        if (! is_string($token) || $token === '') {
            return response()->json(['message' => 'Missing cart token.'], 401);
        }

        $cart = Cart::query()->where('token', $token)->first();
        if (! $cart) {
            return response()->json(['message' => 'Cart not found.'], 404);
        }

        $request->attributes->set('cart', $cart);

        return $next($request);
    }
}
