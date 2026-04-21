<?php

namespace App\Mail;

use App\Models\Order;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeCredentialsMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public string $password,
        public Order $order
    ) {}

    public function envelope(): Envelope
    {
        $app = (string) config('app.name', 'KU');

        return new Envelope(
            subject: 'Your account is ready — '.$app.' Workshop Platform',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.welcome-credentials',
            with: [
                'user' => $this->user,
                'password' => $this->password,
                'order' => $this->order,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
