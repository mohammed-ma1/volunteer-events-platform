<?php

namespace App\Services;

use App\Models\Order;
use App\Support\TapMoney;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class TapPaymentService
{
    /**
     * @param  string|null  $langCode  Tap redirect page language: en or ar (from X-Checkout-Locale)
     */
    public function createChargeForOrder(Order $order, ?string $langCode = null): array
    {
        $tapMock = (bool) config('services.tap.mock');
        if ($tapMock && ! app()->isLocal()) {
            Log::warning('TAP_MOCK is set in .env but only applies when APP_ENV=local; using live Tap API.');
        }
        $useTapMock = $tapMock && app()->isLocal();

        $frontend = $this->resolvePublicFrontendBaseUrl();
        $returnUrl = $frontend.'/checkout/tap-return?order='.$order->uuid;

        if ($useTapMock) {
            return [
                'id' => 'chg_mock_'.$order->uuid,
                'transaction' => ['url' => $returnUrl.'&mock=1'],
            ];
        }

        $secret = (string) config('services.tap.secret');
        if ($secret === '') {
            throw new RuntimeException('Tap secret key is not configured.');
        }

        $amount = TapMoney::formatAmount($order->total, $order->currency);
        $customer = [
            'first_name' => $order->customer_name,
            'email' => $order->email,
        ];
        if ($order->phone) {
            $customer['phone'] = $order->phone;
        }

        $payload = [
            'amount' => (float) $amount,
            'currency' => $order->currency,
            'threeDSecure' => true,
            'save_card' => false,
            'description' => 'Volunteer events order '.$order->uuid,
            'metadata' => [
                'order_uuid' => $order->uuid,
            ],
            // Tap rejects UUIDs in reference.order (error 1204). Use numeric DB id; keep UUID in metadata only.
            'reference' => [
                'transaction' => 'txn_'.$order->getKey(),
                'order' => (string) $order->getKey(),
            ],
            'customer' => $customer,
            'source' => [
                'id' => config('services.tap.source_id', 'src_all'),
            ],
            'post' => [
                'url' => url('/api/v1/webhooks/tap'),
            ],
            'redirect' => [
                'url' => $returnUrl,
            ],
        ];

        $merchantId = config('services.tap.merchant_id');
        if (is_string($merchantId) && $merchantId !== '') {
            $payload['merchant'] = ['id' => $merchantId];
        }

        $headers = [];
        $lang = strtolower((string) ($langCode ?? ''));
        if (in_array($lang, ['en', 'ar'], true)) {
            $headers['lang_code'] = $lang;
        }

        $request = Http::withToken($secret)
            ->acceptJson()
            ->asJson()
            ->withHeaders($headers);

        $response = $request->post(rtrim((string) config('services.tap.api_base'), '/').'/charges', $payload);

        if (! $response->successful()) {
            Log::warning('Tap charge failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new RuntimeException('Unable to start payment.');
        }

        return $response->json();
    }

    /**
     * Tap redirect / iframe must use the real public HTTPS origin. A wrong FRONTEND_URL (e.g. leftover
     * http://localhost:4200) embeds blocked mixed content when checkout runs on https://kw...
     */
    private function resolvePublicFrontendBaseUrl(): string
    {
        $configured = rtrim((string) config('app.frontend_url'), '/');
        if ($configured === '') {
            $configured = rtrim((string) config('app.url'), '/');
        }

        if ($this->urlLooksLikeLocalDevServer($configured) && ! app()->isLocal()) {
            $fallback = rtrim((string) config('app.url'), '/');
            if ($fallback !== '' && ! $this->urlLooksLikeLocalDevServer($fallback)) {
                Log::warning('FRONTEND_URL points to localhost; using APP_URL for Tap return URL.', [
                    'FRONTEND_URL' => $configured,
                    'APP_URL' => $fallback,
                ]);

                return $fallback;
            }
        }

        return $configured;
    }

    private function urlLooksLikeLocalDevServer(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (! is_string($host) || $host === '') {
            return false;
        }

        $host = strtolower($host);

        return $host === 'localhost'
            || $host === '127.0.0.1'
            || str_ends_with($host, '.localhost');
    }

    /**
     * GET /v2/charges/{charge_id} — verify status after redirect (same shape as webhook payload).
     *
     * @return array<string, mixed>
     */
    public function retrieveCharge(string $chargeId): array
    {
        if (app()->isLocal() && config('services.tap.mock') && str_starts_with($chargeId, 'chg_mock_')) {
            $uuid = substr($chargeId, strlen('chg_mock_'));

            return [
                'id' => $chargeId,
                'object' => 'charge',
                'status' => 'CAPTURED',
                'metadata' => ['order_uuid' => $uuid],
            ];
        }

        $secret = (string) config('services.tap.secret');
        if ($secret === '') {
            throw new RuntimeException('Tap secret key is not configured.');
        }

        $base = rtrim((string) config('services.tap.api_base'), '/');
        $response = Http::withToken($secret)
            ->acceptJson()
            ->get($base.'/charges/'.$chargeId);

        if (! $response->successful()) {
            Log::warning('Tap retrieve charge failed', [
                'charge_id' => $chargeId,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new RuntimeException('Unable to retrieve charge from Tap.');
        }

        /** @var array<string, mixed> */
        return $response->json();
    }
}
