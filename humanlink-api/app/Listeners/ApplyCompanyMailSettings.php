<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\User;
use App\Support\CompanyMailConfigurator;
use Illuminate\Mail\Events\MessageSending;
use Illuminate\Notifications\Events\NotificationSending;

class ApplyCompanyMailSettings
{
    public function __construct(
        private CompanyMailConfigurator $mailConfigurator
    ) {}

    public function handleNotificationSending(NotificationSending $event): void
    {
        $notifiable = $event->notifiable;

        if ($notifiable instanceof User) {
            $this->mailConfigurator->applyForUser($notifiable);
        }
    }

    public function handleMessageSending(MessageSending $event): void
    {
        $this->mailConfigurator->apply();
    }
}
