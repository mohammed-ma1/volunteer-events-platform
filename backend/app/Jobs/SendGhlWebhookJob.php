<?php

namespace App\Jobs;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendGhlWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(
        private readonly Order $order
    ) {}

    public function handle(): void
    {
        $url = config('services.ghl.webhook_url');

        if (! is_string($url) || $url === '') {
            return;
        }

        $order = $this->order->loadMissing('items');

        $nameParts = preg_split('/\s+/', trim($order->customer_name), 2);
        $firstName = $nameParts[0] ?? '';
        $lastName = $nameParts[1] ?? '';

        $payload = [
            'first_name' => $firstName,
            'last_name' => $lastName,
            'full_name' => $order->customer_name,
            'email' => $order->email,
            'phone' => $order->phone,
            'order_reference' => $order->invoiceReference(),
            'order_uuid' => $order->uuid,
            'order_total' => (float) $order->total,
            'currency' => $order->currency,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'tags' => ['ku-workshop-buyer'],
            'items_summary' => $order->items->map(fn ($item) =>
                $item->event_title . ' (x' . $item->quantity . ' — ' . number_format((float) $item->unit_price, 3) . ' ' . $order->currency . ')'
            )->implode(', '),
            'items' => $order->items->map(fn ($item) => [
                'event_title' => $item->event_title,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
            ])->all(),
        ];

        $response = Http::timeout(15)
            ->acceptJson()
            ->post($url, $payload);

        if ($response->failed()) {
            Log::warning('GHL webhook failed', [
                'order_uuid' => $order->uuid,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            $this->release($this->backoff[$this->attempts() - 1] ?? 60);

            return;
        }

        Log::info('GHL webhook sent', [
            'order_uuid' => $order->uuid,
            'reference' => $order->invoiceReference(),
        ]);
    }
}
