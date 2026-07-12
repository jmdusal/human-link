<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\User;
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
    ) {
        $this->afterCommit();
    }

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

        $companyName = $this->resolveCompanyName($notifiable);

        if ($this->isInvite) {
            $companyLabel = e($companyName ?? 'your company');

            return (new MailMessage)
                ->subject(($companyName ? "Welcome to {$companyName}" : 'Welcome to HumanLink').' — set your password')
                ->view('emails.branded-action', [
                    'title' => 'Welcome aboard',
                    'companyName' => $companyName,
                    'userName' => $notifiable->name,
                    'body' => '<strong style="color: #0f172a;">'.$companyLabel.'</strong> created an account for you on HumanLink. Set your password to finish onboarding.',
                    'actionUrl' => $url,
                    'actionLabel' => 'Set password',
                    'footer' => 'This link expires in 60 minutes.<br>If you did not expect this, contact your administrator.',
                ]);
        }

        return (new MailMessage)
            ->subject('Reset your HumanLink password')
            ->view('emails.branded-action', [
                'title' => 'Password reset',
                'companyName' => $companyName,
                'userName' => $notifiable->name,
                'body' => 'We received a request to reset your password'.($companyName ? ' for your <strong style="color: #0f172a;">'.e($companyName).'</strong> account' : '').'. Use the button below to choose a new one.',
                'actionUrl' => $url,
                'actionLabel' => 'Reset password',
                'footer' => 'This link expires in 60 minutes.<br>If you did not request a reset, you can ignore this email.',
            ]);
    }

    private function resolveCompanyName(object $notifiable): ?string
    {
        if (! $notifiable instanceof User) {
            return null;
        }

        $notifiable->loadMissing('company:id,name');

        $name = $notifiable->company?->name;

        return filled($name) ? (string) $name : null;
    }
}
