<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\User;

trait ManagesUserDetails
{
    protected function createUserDetails(User $user, array $data): void
    {
        $user->details()->create($this->detailPayload($data));
    }

    protected function syncUserDetails(User $user, array $data): void
    {
        if (! $this->hasDetailFields($data)) {
            return;
        }

        $user->details()->updateOrCreate(
            ['user_id' => $user->id],
            $this->detailPayload($data)
        );
    }

    protected function hasDetailFields(array $data): bool
    {
        foreach ($this->detailKeys() as $key) {
            if (array_key_exists($key, $data)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array<string, mixed>
     */
    protected function detailPayload(array $data): array
    {
        return array_intersect_key($data, array_flip($this->detailKeys()));
    }

    /**
     * @return list<string>
     */
    protected function detailKeys(): array
    {
        return [
            'sss_number',
            'philhealth_number',
            'pagibig_number',
            'tin',
            'job_title',
            'department',
            'employment_type',
            'mobile',
            'emergency_contact_name',
            'emergency_contact_phone',
            'emergency_contact_relationship',
        ];
    }
}
