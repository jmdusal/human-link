<?php

declare(strict_types=1);

namespace App\Notifications\Channels;

use App\Models\User;
use Illuminate\Notifications\Channels\DatabaseChannel;
use Illuminate\Notifications\Notification;

class CompanyDatabaseChannel extends DatabaseChannel
{
    /**
     * @return array<string, mixed>
     */
    protected function buildPayload($notifiable, Notification $notification): array
    {
        $payload = parent::buildPayload($notifiable, $notification);
        $companyId = $this->resolveCompanyId($notifiable, $notification);

        $payload['company_id'] = $companyId;

        $data = $payload['data'] ?? [];
        if (is_array($data) && ! array_key_exists('company_id', $data)) {
            $data['company_id'] = $companyId;
            $payload['data'] = $data;
        }

        return $payload;
    }

    protected function resolveCompanyId(object $notifiable, Notification $notification): ?int
    {
        if (method_exists($notification, 'companyId')) {
            $companyId = $notification->companyId($notifiable);

            if ($companyId !== null) {
                return (int) $companyId;
            }
        }

        if ($notifiable instanceof User && $notifiable->company_id !== null) {
            return (int) $notifiable->company_id;
        }

        return null;
    }
}
