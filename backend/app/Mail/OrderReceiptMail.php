<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderReceiptMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        $app = (string) config('app.name', 'KU');

        return new Envelope(
            subject: 'Payment confirmed — your workshop receipt ('.$app.')',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order-receipt',
            with: [
                'order' => $this->order,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
