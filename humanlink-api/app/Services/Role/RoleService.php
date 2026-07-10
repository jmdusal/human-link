<?php

declare(strict_types=1);

namespace App\Services\Role;

use App\Contracts\RoleServiceInterface;
use App\Models\Role;
use App\Services\Role\Concerns\ManagesRolePermissions;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class RoleService implements RoleServiceInterface
{
    use ManagesRolePermissions;

    public function list(): Collection
    {
        return Role::query()
            ->with('permissions')
            ->latest()
            ->get();
    }

    public function create(array $data): Role
    {
        return DB::transaction(function () use ($data): Role {
            $role = Role::create([
                ...$this->rolePayload($data),
                'guard_name' => 'web',
            ]);

            if (array_key_exists('permissions', $data)) {
                $this->syncPermissions($role, $data['permissions']);
            }

            return $role->load('permissions');
        });
    }

    public function update(Role $role, array $data): Role
    {
        return DB::transaction(function () use ($role, $data): Role {
            $role->update($this->rolePayload($data));

            if (array_key_exists('permissions', $data)) {
                $this->syncPermissions($role, $data['permissions']);
            }

            return $role->load('permissions');
        });
    }

    public function delete(Role $role): void
    {
        $role->delete();
    }

    protected function rolePayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'name',
        ]));
    }
}
