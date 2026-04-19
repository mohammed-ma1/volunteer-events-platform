<?php

namespace App\Mail;

use App\Models\Order;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderPaidTeamNotificationMail extends Mailable
{
    use SerializesModels;

    public function __construct(
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        $ref = $this->order->invoiceReference();
        $name = trim((string) $this->order->customer_name);

        $replyTo = $name !== ''
            ? [new Address($this->order->email, $name)]
            : [new Address($this->order->email)];

        return new Envelope(
            subject: 'Payment completed — '.$ref.($name !== '' ? ' — '.$name : ''),
            replyTo: $replyTo,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.order-paid-team-notification',
            with: [
                'order' => $this->order,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
