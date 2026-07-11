<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class TimerForgottenNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->withCompanyContext($this->payload(), $notifiable));
    }

    public function toArray(object $notifiable): array
    {
        return $this->withCompanyContext($this->payload(), $notifiable);
    }

    /**
     * @return array<string, mixed>
     */
    protected function payload(): array
    {
        return [
            'title' => 'Timer still running',
            'message' => 'Your attendance timer is still running. Please end your day if you have finished work.',
            'type' => 'timer_forgotten',
            'time' => now()->diffForHumans(),
        ];
    }
}
