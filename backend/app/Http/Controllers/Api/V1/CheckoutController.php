<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Event;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\TapPaymentService;
use App\Support\TapChargePayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly TapPaymentService $tapPaymentService
    ) {}

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email', 'max:255'],
            'customer_name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        /** @var \App\Models\Cart $cart */
        $cart = $request->attributes->get('cart');
        $cart->load(['items.event']);

        if ($cart->items->isEmpty()) {
            return response()->json(['message' => 'Cart is empty.'], 422);
        }

        $idempotencyKey = $request->header('Idempotency-Key');
        if (is_string($idempotencyKey) && $idempotencyKey !== '') {
            $existing = Order::query()->where('idempotency_key', $idempotencyKey)->first();
            if ($existing) {
                return $this->orderResponse($existing, 200);
            }
        }

        try {
            $order = DB::transaction(function () use ($cart, $data, $idempotencyKey) {
                $currency = $cart->items->first()->event->currency;

                $order = Order::createFresh([
                    'idempotency_key' => is_string($idempotencyKey) && $idempotencyKey !== '' ? $idempotencyKey : null,
                    'email' => $data['email'],
                    'customer_name' => $data['customer_name'],
                    'phone' => $data['phone'] ?? null,
                    'currency' => $currency,
                    'status' => Order::STATUS_PENDING_PAYMENT,
                ]);

                $subtotal = 0.0;
                foreach ($cart->items as $line) {
                    /** @var CartItem $line */
                    $event = $line->event;
                    if (! $event instanceof Event) {
                        continue;
                    }
                    $unit = (float) $event->price;
                    $qty = (int) $line->quantity;
                    $lineTotal = round($unit * $qty, 3);
                    $subtotal += $lineTotal;

                    OrderItem::query()->create([
                        'order_id' => $order->id,
                        'event_id' => $event->id,
                        'event_title' => $event->title,
                        'unit_price' => $unit,
                        'quantity' => $qty,
                    ]);
                }

                $order->update([
                    'subtotal' => round($subtotal, 3),
                    'total' => round($subtotal, 3),
                ]);

                $cart->items()->delete();

                return $order->fresh(['items']);
            });
        } catch (Throwable) {
            return response()->json(['message' => 'Checkout failed.'], 500);
        }

        $checkoutLocale = $request->header('X-Checkout-Locale');
        $langCode = is_string($checkoutLocale) && in_array(strtolower($checkoutLocale), ['en', 'ar'], true)
            ? strtolower($checkoutLocale)
            : null;

        try {
            $charge = $this->tapPaymentService->createChargeForOrder($order, $langCode, $request);
        } catch (Throwable $e) {
            Log::error('Checkout Tap create charge failed', [
                'order_uuid' => $order->uuid,
                'exception' => $e->getMessage(),
            ]);
            $order->update(['status' => Order::STATUS_FAILED]);

            return response()->json(['message' => 'Payment provider error.'], 502);
        }

        $chargeId = $charge['id'] ?? null;
        $paymentUrl = data_get($charge, 'transaction.url');

        $order->update([
            'tap_charge_id' => is_string($chargeId) ? $chargeId : null,
            'tap_payment_url' => is_string($paymentUrl) ? $paymentUrl : null,
            'status' => is_string($paymentUrl) ? Order::STATUS_AWAITING_REDIRECT : Order::STATUS_FAILED,
        ]);

        return $this->orderResponse($order->fresh(), 201);
    }

    /**
     * Dev-only: marks order paid when TAP_MOCK is true so tap-return + iframe polling can finish.
     */
    public function mockComplete(string $uuid): JsonResponse|Response
    {
        if (! app()->isLocal() || ! config('services.tap.mock')) {
            return response()->json([
                'message' => 'mock-complete is only available when APP_ENV=local and TAP_MOCK=true.',
            ], 403);
        }

        $order = Order::query()->where('uuid', $uuid)->first();
        if ($order === null) {
            return response()->json([
                'message' => 'No order with this id. Create checkout on this same API/database, or clear stale order ids.',
            ], 404);
        }
        $order->update([
            'status' => Order::STATUS_PAID,
            'paid_at' => now(),
        ]);

        return response()->noContent();
    }

    public function show(string $uuid): JsonResponse
    {
        $order = Order::query()->where('uuid', $uuid)->with('items')->firstOrFail();

        return $this->orderSummaryJson($order);
    }

    /**
     * Fetches the charge from Tap (GET /v2/charges/{id}) and updates local order status.
     */
    public function syncFromTap(string $uuid): JsonResponse
    {
        $order = Order::query()->where('uuid', $uuid)->with('items')->firstOrFail();

        $chargeId = $order->tap_charge_id;
        if (! is_string($chargeId) || $chargeId === '') {
            return $this->orderSummaryJson($order);
        }

        try {
            $charge = $this->tapPaymentService->retrieveCharge($chargeId);
        } catch (Throwable) {
            return response()->json(['message' => 'Unable to verify payment with Tap.'], 502);
        }

        $metaUuid = data_get($charge, 'metadata.order_uuid');
        if (is_string($metaUuid) && $metaUuid !== '' && $metaUuid !== $order->uuid) {
            return response()->json(['message' => 'Charge does not match this order.'], 422);
        }

        TapChargePayload::applyToOrder($order, $charge);

        return $this->orderSummaryJson($order->fresh(['items']));
    }

    private function orderSummaryJson(Order $order): JsonResponse
    {
        return response()->json([
            'uuid' => $order->uuid,
            'status' => $order->status,
            'total' => (float) $order->total,
            'currency' => $order->currency,
            'email' => $order->email,
            'customer_name' => $order->customer_name,
            'items' => $order->items->map(fn (OrderItem $i) => [
                'event_title' => $i->event_title,
                'quantity' => $i->quantity,
                'unit_price' => (float) $i->unit_price,
            ]),
        ]);
    }

    private function orderResponse(Order $order, int $status = 201): JsonResponse
    {
        return response()->json([
            'order_uuid' => $order->uuid,
            'status' => $order->status,
            'payment_url' => $order->tap_payment_url,
            'total' => (float) $order->total,
            'currency' => $order->currency,
        ], $status);
    }
}
