<?php

declare(strict_types=1);

namespace App\Services\User\Concerns;

use App\Models\Department;
use App\Models\Position;
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
        $payload = array_intersect_key($data, array_flip($this->detailKeys()));

        return $this->syncJobProfileFromRelations($payload);
    }

    /**
     * Keep denormalized job_title/department in sync for contracts and display.
     *
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function syncJobProfileFromRelations(array $payload): array
    {
        if (array_key_exists('position_id', $payload) && $payload['position_id']) {
            $position = Position::query()
                ->with('department:id,name')
                ->find($payload['position_id']);

            if ($position) {
                $payload['job_title'] = $position->name;
                $payload['department_id'] = $position->department_id;
                $payload['department'] = $position->department?->name;
            }

            return $payload;
        }

        if (array_key_exists('department_id', $payload) && $payload['department_id']) {
            $department = Department::query()->find($payload['department_id']);

            if ($department) {
                $payload['department'] = $department->name;
            }
        }

        if (array_key_exists('position_id', $payload) && $payload['position_id'] === null) {
            $payload['job_title'] = $payload['job_title'] ?? null;
        }

        return $payload;
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
            'department_id',
            'position_id',
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
