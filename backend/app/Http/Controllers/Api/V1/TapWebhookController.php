<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Support\TapChargePayload;
use App\Support\TapWebhookVerifier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class TapWebhookController extends Controller
{
    public function handle(Request $request): Response
    {
        $secret = (string) config('services.tap.secret');
        $shouldVerify = (bool) config('services.tap.verify_webhook', true)
            && ! (bool) config('services.tap.mock');

        if ($shouldVerify && $secret === '') {
            return response('Misconfigured', 500);
        }

        if ($shouldVerify && ! TapWebhookVerifier::verify($request, $secret)) {
            Log::warning('Tap webhook rejected: invalid hashstring');

            return response('Invalid signature', 400);
        }

        $payload = $request->json()->all();
        $object = $payload['object'] ?? '';

        if ($object !== 'charge') {
            return response('Ignored', 200);
        }

        $orderUuid = data_get($payload, 'metadata.order_uuid');
        if (! is_string($orderUuid) || $orderUuid === '') {
            return response('No order', 200);
        }

        $order = Order::query()->where('uuid', $orderUuid)->first();
        if (! $order) {
            return response('OK', 200);
        }

        TapChargePayload::applyToOrder($order, $payload);

        return response('OK', 200);
    }
}
