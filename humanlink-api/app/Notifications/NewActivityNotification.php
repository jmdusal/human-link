<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewActivityNotification extends Notification implements ShouldBroadcastNow
{
    public function via($notifiable): array {
        return ['database', 'broadcast'];
    }

    public function toBroadcast($notifiable): BroadcastMessage {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => 'User Created Successfully!',
            'time' => now()->diffForHumans(),
        ]);
    }

    public function toArray($notifiable): array {
        return [
            'title' => 'User Created Successfully!',
            'time' => now()->diffForHumans(),
        ];
    }

    // public function broadcastType(): string
    // {
    //     return 'new.activity';
    // }

    // public function broadcastOn(): array
    // {
    //     return [
    //         new \Illuminate\Broadcasting\PrivateChannel('App.Models.User.' . $this->id ?? '1')
    //     ];
    // }
}
