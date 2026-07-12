<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TwoFactorEmailCodeNotification extends Notification
{
    use HasCompanyContext;

    public function __construct(
        private string $code,
        private string $purpose = 'login'
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isSetup = $this->purpose === 'setup';

        if (method_exists($notifiable, 'loadMissing')) {
            $notifiable->loadMissing('company');
        }

        $companyName = null;
        if (isset($notifiable->company) && is_object($notifiable->company)) {
            $companyName = $notifiable->company->name ?? null;
        }

        return (new MailMessage)
            ->subject($isSetup ? 'Your HumanLink 2FA setup code' : 'Your HumanLink login code')
            ->view('emails.branded-otp', [
                'title' => $isSetup ? 'Enable two-factor auth' : 'Sign-in verification',
                'userName' => $notifiable->name ?? 'there',
                'body' => $isSetup
                    ? 'Use this one-time code to finish enabling email two-factor authentication on your HumanLink account.'
                    : 'Use this one-time code to finish signing in to HumanLink.',
                'code' => $this->code,
                'footer' => 'This code expires in 10 minutes. If you did not request it, you can ignore this email.',
                'companyName' => $companyName,
            ]);
    }
}
