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
        Log::info('Cart middleware hit', [
            'method' => $request->method(),
            'url' => $request->path(),
            'has_token' => is_string($token) && $token !== '',
            'token' => is_string($token) ? substr($token, 0, 12).'...' : null,
        ]);

        if (! is_string($token) || $token === '') {
            return response()->json(['message' => 'Missing cart token.'], 401);
        }

        $cart = Cart::query()->where('token', $token)->first();
        if (! $cart) {
            Log::warning('Cart middleware: token not found in DB', ['token' => $token]);

            return response()->json(['message' => 'Cart not found.'], 404);
        }

        Log::info('Cart middleware: found cart', ['cart_id' => $cart->id, 'items' => $cart->items()->count()]);

        $request->attributes->set('cart', $cart);

        return $next($request);
    }
}
