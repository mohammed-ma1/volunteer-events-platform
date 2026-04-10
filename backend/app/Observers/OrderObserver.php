<?php

namespace App\Observers;

use App\Models\Order;
use App\Services\OrderReceiptMailer;

class OrderObserver
{
    public function __construct(
        private readonly OrderReceiptMailer $receiptMailer
    ) {}

    public function updated(Order $order): void
    {
        if ($order->status !== Order::STATUS_PAID || ! $order->wasChanged('status')) {
            return;
        }

        $this->receiptMailer->sendIfPaidAndNotSent($order);
    }
}
