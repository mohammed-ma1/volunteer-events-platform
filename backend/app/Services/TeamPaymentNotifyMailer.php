<?php

namespace App\Services;

use App\Mail\OrderPaidTeamNotificationMail;
use App\Models\Order;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class TeamPaymentNotifyMailer
{
    /**
     * Notifies internal recipients once per paid order. Swallows mail errors so payment flows are not broken.
     */
    public function sendIfPaidAndNotSent(Order $order): void
    {
        $recipients = config('services.internal_payment_notify.recipients', []);
        if (! is_array($recipients) || $recipients === []) {
            return;
        }

        $recipients = array_values(array_unique(array_filter(array_map(
            static fn (mixed $e): string => is_string($e) ? trim($e) : '',
            $recipients
        ))));

        if ($recipients === []) {
            return;
        }

        try {
            DB::transaction(function () use ($order, $recipients): void {
                /** @var Order|null $locked */
                $locked = Order::query()->with('items')->whereKey($order->id)->lockForUpdate()->first();
                if ($locked === null) {
                    return;
                }
                if ($locked->status !== Order::STATUS_PAID || $locked->team_payment_notify_sent_at !== null) {
                    return;
                }

                $primary = array_shift($recipients);
                $mail = Mail::to($primary);
                if ($recipients !== []) {
                    $mail->bcc($recipients);
                }
                $mail->send(new OrderPaidTeamNotificationMail($locked));

                $locked->forceFill(['team_payment_notify_sent_at' => now()])->save();

                Log::info('Team payment notification email sent', [
                    'order_uuid' => $locked->uuid,
                    'mailer' => config('mail.default'),
                ]);
            });
        } catch (Throwable $e) {
            Log::error('Team payment notification email failed', [
                'order_id' => $order->id,
                'exception' => $e->getMessage(),
            ]);
        }
    }
}
