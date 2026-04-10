<?php

namespace App\Support;

use Illuminate\Http\Request;

final class TapWebhookVerifier
{
    public static function verify(Request $request, string $secretKey): bool
    {
        $posted = $request->header('hashstring');
        if (! is_string($posted) || $posted === '') {
            return false;
        }

        $payload = $request->json()->all();
        if ($payload === []) {
            return false;
        }

        $object = $payload['object'] ?? '';

        $id = (string) ($payload['id'] ?? '');
        $amount = TapMoney::formatAmount($payload['amount'] ?? 0, (string) ($payload['currency'] ?? 'USD'));
        $currency = (string) ($payload['currency'] ?? '');
        $status = (string) ($payload['status'] ?? '');

        $gatewayRef = '';
        $paymentRef = '';
        $created = '';

        if (in_array($object, ['charge', 'authorize', 'refund'], true)) {
            $gatewayRef = (string) data_get($payload, 'reference.gateway', '');
            $paymentRef = (string) data_get($payload, 'reference.payment', '');
            $created = (string) data_get($payload, 'transaction.created', '');
        } elseif ($object === 'invoice') {
            $updated = (string) ($payload['updated'] ?? '');
            $created = (string) ($payload['created'] ?? '');
            $toBeHashed = 'x_id'.$id.'x_amount'.$amount.'x_currency'.$currency.'x_updated'.$updated.'x_status'.$status.'x_created'.$created;

            return hash_equals($posted, hash_hmac('sha256', $toBeHashed, $secretKey));
        } else {
            return false;
        }

        $toBeHashed = 'x_id'.$id.'x_amount'.$amount.'x_currency'.$currency.'x_gateway_reference'.$gatewayRef.'x_payment_reference'.$paymentRef.'x_status'.$status.'x_created'.$created;

        return hash_equals($posted, hash_hmac('sha256', $toBeHashed, $secretKey));
    }
}
