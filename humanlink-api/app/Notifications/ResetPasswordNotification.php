<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $token,
        public bool $isInvite = false,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontend = rtrim((string) config('app.frontend_url'), '/');
        $url = $frontend.'/reset-password?token='.urlencode($this->token)
            .'&email='.urlencode((string) $notifiable->email)
            .($this->isInvite ? '&invite=1' : '');

        if ($this->isInvite) {
            return (new MailMessage)
                ->subject('Welcome to HumanLink — set your password')
                ->view('emails.branded-action', [
                    'title' => 'Welcome aboard',
                    'userName' => $notifiable->name,
                    'body' => 'An account was created for you on HumanLink. Set your password to finish onboarding.',
                    'actionUrl' => $url,
                    'actionLabel' => 'Set password',
                    'footer' => 'This link expires in 60 minutes.<br>If you did not expect this, contact your administrator.',
                ]);
        }

        return (new MailMessage)
            ->subject('Reset your HumanLink password')
            ->view('emails.branded-action', [
                'title' => 'Password reset',
                'userName' => $notifiable->name,
                'body' => 'We received a request to reset your password. Use the button below to choose a new one.',
                'actionUrl' => $url,
                'actionLabel' => 'Reset password',
                'footer' => 'This link expires in 60 minutes.<br>If you did not request a reset, you can ignore this email.',
            ]);
    }
}
