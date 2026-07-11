<?php

namespace App\Notifications;

use App\Notifications\Concerns\HasCompanyContext;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewActivityNotification extends Notification implements ShouldBroadcastNow
{
    use HasCompanyContext;

    public function via($notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->withCompanyContext([
            'id' => $this->id,
            'title' => 'User Created Successfully!',
            'time' => now()->diffForHumans(),
        ], $notifiable));
    }

    public function toArray($notifiable): array
    {
        return $this->withCompanyContext([
            'title' => 'User Created Successfully!',
            'time' => now()->diffForHumans(),
        ], $notifiable);
    }
}
