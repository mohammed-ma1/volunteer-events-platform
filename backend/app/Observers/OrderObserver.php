<?php

namespace App\Observers;

use App\Jobs\SendGhlWebhookJob;
use App\Mail\WelcomeCredentialsMail;
use App\Models\Order;
use App\Services\OrderReceiptMailer;
use App\Services\PostPaymentService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OrderObserver
{
    public function __construct(
        private readonly OrderReceiptMailer $receiptMailer,
        private readonly PostPaymentService $postPaymentService
    ) {}

    public function updated(Order $order): void
    {
        if ($order->status !== Order::STATUS_PAID || ! $order->wasChanged('status')) {
            return;
        }

        $this->receiptMailer->sendIfPaidAndNotSent($order);

        try {
            $result = $this->postPaymentService->handlePaidOrder($order);

            if ($result['is_new'] && $result['password']) {
                Mail::to($result['user']->email)->send(
                    new WelcomeCredentialsMail($result['user'], $result['password'], $order->load('items'))
                );

                Log::info('Welcome credentials email sent', [
                    'user_id' => $result['user']->id,
                    'email' => $result['user']->email,
                    'order_uuid' => $order->uuid,
                ]);
            }
        } catch (Throwable $e) {
            Log::error('Post-payment processing failed', [
                'order_uuid' => $order->uuid,
                'exception' => $e->getMessage(),
            ]);
        }

        if (config('services.ghl.webhook_url')) {
            SendGhlWebhookJob::dispatch($order);
        }
    }
}
