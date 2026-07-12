<?php

declare(strict_types=1);

namespace App\Notifications\Concerns;

use App\Models\User;

trait HasCompanyContext
{
    public function companyId(?object $notifiable = null): ?int
    {
        if ($notifiable instanceof User && $notifiable->company_id !== null) {
            return (int) $notifiable->company_id;
        }

        return null;
    }

    public function broadcastType(): string
    {
        if (method_exists($this, 'payload')) {
            /** @var mixed $payload */
            $payload = $this->payload();

            if (is_array($payload) && isset($payload['type']) && is_string($payload['type']) && $payload['type'] !== '') {
                return $payload['type'];
            }
        }

        return static::class;
    }

    protected function withCompanyContext(array $payload, ?object $notifiable = null): array
    {
        if (! array_key_exists('company_id', $payload)) {
            $payload['company_id'] = $this->companyId($notifiable);
        }

        if (isset($payload['type']) && is_string($payload['type']) && $payload['type'] !== '') {
            $payload['notification_type'] = $payload['type'];
        }

        return $payload;
    }
}
