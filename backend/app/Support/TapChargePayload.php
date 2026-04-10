<?php

namespace App\Support;

use App\Models\Order;

/**
 * Maps Tap charge JSON (webhook or GET retrieve) onto our Order model.
 */
final class TapChargePayload
{
    public static function applyToOrder(Order $order, array $payload): void
    {
        if ($order->status === Order::STATUS_PAID) {
            return;
        }

        $status = strtoupper((string) ($payload['status'] ?? ''));

        if ($status === 'CAPTURED') {
            $order->update([
                'status' => Order::STATUS_PAID,
                'paid_at' => now(),
                'tap_charge_id' => (string) ($payload['id'] ?? $order->tap_charge_id),
            ]);

            return;
        }

        if (in_array($status, ['FAILED', 'DECLINED', 'CANCELLED', 'ABANDONED'], true)) {
            $order->update(['status' => Order::STATUS_FAILED]);
        }
    }
}
