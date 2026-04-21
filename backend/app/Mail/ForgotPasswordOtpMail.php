<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ForgotPasswordOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $otpPlain,
        public User $user
    ) {}

    public function envelope(): Envelope
    {
        $app = (string) config('app.name', 'Workshops');

        return new Envelope(
            subject: $app.' — password reset code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.forgot-password-otp',
            with: [
                'user' => $this->user,
                'otpPlain' => $this->otpPlain,
                'frontendUrl' => rtrim((string) config('app.frontend_url'), '/'),
            ],
        );
    }
}
