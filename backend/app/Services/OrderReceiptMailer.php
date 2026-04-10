<?php

namespace App\Services;

use App\Mail\OrderReceiptMail;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderReceiptMailer
{
    /**
     * Sends the HTML receipt once per order (idempotent). Swallows mail errors so payment flows are not broken.
     */
    public function sendIfPaidAndNotSent(Order $order): void
    {
        try {
            DB::transaction(function () use ($order) {
                /** @var Order|null $locked */
                $locked = Order::query()->with('items')->whereKey($order->id)->lockForUpdate()->first();
                if ($locked === null) {
                    return;
                }
                if ($locked->status !== Order::STATUS_PAID || $locked->receipt_email_sent_at !== null) {
                    return;
                }

                Mail::to($locked->email)->send(new OrderReceiptMail($locked));

                $locked->forceFill(['receipt_email_sent_at' => now()])->save();

                Log::info('Order receipt email sent', [
                    'order_uuid' => $locked->uuid,
                    'to' => $locked->email,
                    'mailer' => config('mail.default'),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('Order receipt email failed', [
                'order_id' => $order->id,
                'exception' => $e->getMessage(),
            ]);
        }
    }
}
