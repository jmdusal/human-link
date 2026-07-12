<?php

declare(strict_types=1);

namespace App\Services\UserType\Concerns;

use App\Models\Permission;
use App\Models\User;
use App\Models\UserType;
use Illuminate\Support\Collection;

trait ManagesUserTypePermissions
{
    /**
     * @param  list<string>|null  $permissionNames
     */
    protected function syncPermissions(UserType $userType, ?array $permissionNames): void
    {
        if ($permissionNames === null) {
            return;
        }

        $permissionIds = $this->permissionIdsForNames($permissionNames);
        $userType->permissions()->sync($permissionIds);
    }

    /**
     * Re-apply Spatie direct permissions for every non–super-admin user on this type.
     * Loads permission names once; chunks users to avoid memory spikes (no N+1 reads).
     */
    protected function resyncAssignedUsers(UserType $userType): void
    {
        $permissionNames = $userType->relationLoaded('permissions')
            ? $userType->permissions->pluck('name')->all()
            : $userType->permissions()->pluck('permissions.name')->all();

        User::query()
            ->where('user_type_id', $userType->id)
            ->whereDoesntHave('roles', function ($query): void {
                $query->where('name', 'super-admin');
            })
            ->select(['id'])
            ->orderBy('id')
            ->chunkById(100, function (Collection $users) use ($permissionNames): void {
                foreach ($users as $user) {
                    /** @var User $user */
                    $user->syncPermissions($permissionNames);
                }
            });
    }

    /**
     * @param  list<string>  $permissionNames
     * @return list<int>
     */
    protected function permissionIdsForNames(array $permissionNames): array
    {
        if ($permissionNames === []) {
            return [];
        }

        return Permission::query()
            ->whereIn('name', $permissionNames)
            ->pluck('id')
            ->map(fn ($id): int => (int) $id)
            ->all();
    }
}
