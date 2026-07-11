<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends BaseVerifyEmail
{
    protected function verificationUrl($notifiable): string
    {
        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());

        $apiUrl = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes((int) Config::get('auth.verification.expire', 60)),
            [
                'id' => $id,
                'hash' => $hash,
            ]
        );

        $query = parse_url($apiUrl, PHP_URL_QUERY) ?: '';
        $frontend = rtrim((string) config('app.frontend_url'), '/');

        return $frontend.'/verify-email?id='.urlencode((string) $id)
            .'&hash='.urlencode($hash)
            .($query !== '' ? '&'.$query : '');
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your HumanLink email')
            ->view('emails.branded-action', [
                'title' => 'Verify your email',
                'userName' => $notifiable->name,
                'body' => 'Please verify your email address to secure your HumanLink account.',
                'actionUrl' => $this->verificationUrl($notifiable),
                'actionLabel' => 'Verify email',
                'footer' => 'If you did not create an account, no further action is required.',
            ]);
    }
}
