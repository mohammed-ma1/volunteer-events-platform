<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Order;
use App\Services\TapPaymentService;
use App\Support\TapChargePayload;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private readonly TapPaymentService $tapPaymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Order::with('items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($q = $request->query('q')) {
            $query->where(function ($qb) use ($q) {
                $qb->where('customer_name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('uuid', 'like', "%{$q}%");
            });
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $perPage = min((int) $request->query('per_page', 15), 100);

        $orders = $query->latest()->paginate($perPage);

        return response()->json($orders);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = Order::with('items')->where('uuid', $uuid)->firstOrFail();

        return response()->json([
            'data' => $this->serializeOrder($order),
        ]);
    }

    /**
     * Sync an order's payment status from the Tap API.
     */
    public function syncTap(string $uuid): JsonResponse
    {
        $order = Order::with('items')->where('uuid', $uuid)->firstOrFail();

        $chargeId = $order->tap_charge_id;
        if (! is_string($chargeId) || $chargeId === '') {
            return response()->json(['message' => 'No Tap charge ID on this order.'], 422);
        }

        try {
            $charge = $this->tapPaymentService->retrieveCharge($chargeId);
        } catch (Throwable $e) {
            Log::warning('Admin Tap sync failed', ['uuid' => $uuid, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to retrieve charge from Tap.'], 502);
        }

        $oldStatus = $order->status;
        TapChargePayload::applyToOrder($order, $charge);

        ActivityLog::record(
            Auth::guard('api')->id(),
            'order.tap_synced',
            'Order',
            $order->id,
            ['from' => $oldStatus, 'to' => $order->fresh()->status, 'tap_status' => $charge['status'] ?? null]
        );

        return response()->json([
            'data' => $this->serializeOrder($order->fresh(['items'])),
            'tap_status' => $charge['status'] ?? null,
        ]);
    }

    /**
     * Retrieve full Tap charge details for an order.
     */
    public function tapDetails(string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)->firstOrFail();

        $chargeId = $order->tap_charge_id;
        if (! is_string($chargeId) || $chargeId === '') {
            return response()->json(['message' => 'No Tap charge ID on this order.'], 422);
        }

        try {
            $charge = $this->tapPaymentService->retrieveCharge($chargeId);
        } catch (Throwable $e) {
            return response()->json(['message' => 'Unable to retrieve charge from Tap.'], 502);
        }

        return response()->json([
            'data' => [
                'id' => $charge['id'] ?? null,
                'status' => $charge['status'] ?? null,
                'amount' => $charge['amount'] ?? null,
                'currency' => $charge['currency'] ?? null,
                'created' => $charge['created'] ?? null,
                'description' => $charge['description'] ?? null,
                'source' => [
                    'payment_method' => data_get($charge, 'source.payment_method'),
                    'payment_type' => data_get($charge, 'source.payment_type'),
                    'channel' => data_get($charge, 'source.channel'),
                ],
                'card' => [
                    'brand' => data_get($charge, 'card.brand'),
                    'last_four' => data_get($charge, 'card.last_four') ?? data_get($charge, 'card.last4'),
                    'scheme' => data_get($charge, 'card.scheme'),
                    'first_six' => data_get($charge, 'card.first_six'),
                ],
                'customer' => [
                    'first_name' => data_get($charge, 'customer.first_name'),
                    'email' => data_get($charge, 'customer.email'),
                    'phone' => data_get($charge, 'customer.phone'),
                ],
                'gateway_response' => [
                    'code' => data_get($charge, 'gateway.response.code'),
                    'message' => data_get($charge, 'gateway.response.message'),
                ],
                'receipt' => $charge['receipt'] ?? null,
                'reference' => $charge['reference'] ?? null,
                'metadata' => $charge['metadata'] ?? null,
            ],
        ]);
    }

    /**
     * Refund a paid order via Tap.
     */
    public function refund(Request $request, string $uuid): JsonResponse
    {
        $order = Order::where('uuid', $uuid)->firstOrFail();

        if ($order->status !== Order::STATUS_PAID) {
            return response()->json(['message' => 'Only paid orders can be refunded.'], 422);
        }

        $chargeId = $order->tap_charge_id;
        if (! is_string($chargeId) || $chargeId === '') {
            return response()->json(['message' => 'No Tap charge ID on this order.'], 422);
        }

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $secret = (string) config('services.tap.secret');
        if ($secret === '') {
            return response()->json(['message' => 'Tap secret key is not configured.'], 500);
        }

        $tapMock = (bool) config('services.tap.mock') && app()->isLocal();

        if ($tapMock) {
            $order->update(['status' => Order::STATUS_CANCELLED]);

            ActivityLog::record(
                Auth::guard('api')->id(),
                'order.refunded',
                'Order',
                $order->id,
                ['reason' => $validated['reason'], 'mock' => true]
            );

            return response()->json([
                'data' => $this->serializeOrder($order->fresh(['items'])),
                'refund_id' => 'ref_mock_'.$order->uuid,
            ]);
        }

        $base = rtrim((string) config('services.tap.api_base'), '/');

        try {
            $response = Http::withToken($secret)
                ->acceptJson()
                ->asJson()
                ->post($base.'/refunds', [
                    'charge_id' => $chargeId,
                    'amount' => (float) $order->total,
                    'currency' => $order->currency,
                    'description' => $validated['reason'],
                    'reason' => 'requested_by_customer',
                    'metadata' => [
                        'order_uuid' => $order->uuid,
                        'refunded_by' => Auth::guard('api')->user()->email,
                    ],
                ]);

            if (! $response->successful()) {
                Log::warning('Tap refund failed', [
                    'uuid' => $uuid,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return response()->json([
                    'message' => 'Refund failed: '.($response->json('errors.0.description') ?? 'Unknown error'),
                ], 502);
            }

            $refundData = $response->json();

            $order->update(['status' => Order::STATUS_CANCELLED]);

            ActivityLog::record(
                Auth::guard('api')->id(),
                'order.refunded',
                'Order',
                $order->id,
                ['reason' => $validated['reason'], 'refund_id' => $refundData['id'] ?? null]
            );

            return response()->json([
                'data' => $this->serializeOrder($order->fresh(['items'])),
                'refund_id' => $refundData['id'] ?? null,
            ]);
        } catch (Throwable $e) {
            Log::error('Tap refund exception', ['uuid' => $uuid, 'error' => $e->getMessage()]);

            return response()->json(['message' => 'Unable to process refund.'], 502);
        }
    }

    /**
     * Export orders as CSV.
     */
    public function export(Request $request)
    {
        $query = Order::with('items');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $orders = $query->latest()->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="orders-'.now()->format('Y-m-d').'.csv"',
        ];

        $callback = function () use ($orders) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, [
                'Order ID', 'UUID', 'Customer Name', 'Email', 'Phone',
                'Status', 'Subtotal', 'Total', 'Currency',
                'Tap Charge ID', 'Paid At', 'Created At', 'Items',
            ]);

            foreach ($orders as $order) {
                $items = $order->items->map(fn ($i) => $i->event_title.' x'.$i->quantity)->implode('; ');
                fputcsv($handle, [
                    $order->id,
                    $order->uuid,
                    $order->customer_name,
                    $order->email,
                    $order->phone ?? '',
                    $order->status,
                    $order->subtotal,
                    $order->total,
                    $order->currency,
                    $order->tap_charge_id ?? '',
                    $order->paid_at?->toIso8601String() ?? '',
                    $order->created_at->toIso8601String(),
                    $items,
                ]);
            }
            fclose($handle);
        };

        ActivityLog::record(
            Auth::guard('api')->id(),
            'orders.exported',
            null,
            null,
            ['filters' => array_filter([
                'status' => $request->query('status'),
                'date_from' => $request->query('date_from'),
                'date_to' => $request->query('date_to'),
            ])]
        );

        return response()->stream($callback, 200, $headers);
    }

    private function serializeOrder(Order $order): array
    {
        return [
            'id' => $order->id,
            'uuid' => $order->uuid,
            'email' => $order->email,
            'customer_name' => $order->customer_name,
            'phone' => $order->phone,
            'status' => $order->status,
            'subtotal' => $order->subtotal,
            'total' => $order->total,
            'currency' => $order->currency,
            'tap_charge_id' => $order->tap_charge_id,
            'tap_payment_url' => $order->tap_payment_url,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'created_at' => $order->created_at->toIso8601String(),
            'updated_at' => $order->updated_at->toIso8601String(),
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'event_id' => $item->event_id,
                'event_title' => $item->event_title,
                'unit_price' => $item->unit_price,
                'quantity' => $item->quantity,
            ]),
        ];
    }
}
