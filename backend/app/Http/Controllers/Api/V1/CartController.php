<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Middleware\EnsureCartToken;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Event;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function store(): JsonResponse
    {
        $cart = Cart::createWithToken();

        return response()->json([
            'token' => $cart->token,
            'expires_at' => $cart->expires_at,
        ], 201)->header(EnsureCartToken::HEADER, $cart->token);
    }

    public function show(Request $request): JsonResponse
    {
        /** @var Cart $cart */
        $cart = $request->attributes->get('cart');
        $cart->load(['items.event']);

        return response()->json($this->serializeCart($cart));
    }

    public function addItem(Request $request): JsonResponse
    {
        $data = $request->validate([
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'quantity' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        /** @var Cart $cart */
        $cart = $request->attributes->get('cart');

        $event = Event::query()->published()->whereKey($data['event_id'])->firstOrFail();
        $qty = (int) ($data['quantity'] ?? 1);

        $item = CartItem::query()->firstOrNew([
            'cart_id' => $cart->id,
            'event_id' => $event->id,
        ]);
        $item->quantity = ($item->exists ? (int) $item->quantity : 0) + $qty;
        $item->save();

        $cart->load(['items.event']);

        return response()->json($this->serializeCart($cart));
    }

    public function updateItem(Request $request, int $itemId): JsonResponse
    {
        $data = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        /** @var Cart $cart */
        $cart = $request->attributes->get('cart');

        $item = CartItem::query()
            ->where('cart_id', $cart->id)
            ->whereKey($itemId)
            ->firstOrFail();

        $item->update(['quantity' => $data['quantity']]);

        $cart->load(['items.event']);

        return response()->json($this->serializeCart($cart));
    }

    public function removeItem(Request $request, int $itemId): JsonResponse
    {
        /** @var Cart $cart */
        $cart = $request->attributes->get('cart');

        CartItem::query()
            ->where('cart_id', $cart->id)
            ->whereKey($itemId)
            ->delete();

        $cart->load(['items.event']);

        return response()->json($this->serializeCart($cart));
    }

    public function clear(Request $request): JsonResponse
    {
        /** @var Cart $cart */
        $cart = $request->attributes->get('cart');

        $cart->items()->delete();
        $cart->load(['items.event']);

        return response()->json($this->serializeCart($cart));
    }

    private function serializeCart(Cart $cart): array
    {
        $lines = $cart->items->map(function (CartItem $item) {
            $event = $item->event;
            $unit = $event ? (float) $event->price : 0.0;

            return [
                'id' => $item->id,
                'quantity' => $item->quantity,
                'event' => $event ? [
                    'id' => $event->id,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'image_url' => $event->image_url,
                    'price' => (float) $event->price,
                    'currency' => $event->currency,
                    'starts_at' => $event->starts_at?->toIso8601String(),
                ] : null,
                'line_total' => round($unit * $item->quantity, 3),
            ];
        });

        $currency = $cart->items->first()?->event?->currency ?? 'KWD';
        $subtotal = $lines->sum('line_total');

        return [
            'token' => $cart->token,
            'items' => $lines->values(),
            'currency' => $currency,
            'subtotal' => round((float) $subtotal, 3),
            'item_count' => $cart->items->sum('quantity'),
        ];
    }
}
