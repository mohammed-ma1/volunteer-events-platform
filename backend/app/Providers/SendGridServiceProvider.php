<?php

namespace App\Providers;

use Illuminate\Mail\MailManager;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Mailer\Bridge\Sendgrid\Transport\SendgridApiTransport;

class SendGridServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        /** @var MailManager $mail */
        $mail = $this->app['mail.manager'];

        $mail->extend('sendgrid', function (array $config) {
            $key = $config['key'] ?? config('services.sendgrid.api_key') ?? env('SENDGRID_API_KEY', '');

            return new SendgridApiTransport($key);
        });
    }
}
