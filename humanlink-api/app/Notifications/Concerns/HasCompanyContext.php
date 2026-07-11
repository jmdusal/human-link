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

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function withCompanyContext(array $payload, ?object $notifiable = null): array
    {
        if (! array_key_exists('company_id', $payload)) {
            $payload['company_id'] = $this->companyId($notifiable);
        }

        return $payload;
    }
}
