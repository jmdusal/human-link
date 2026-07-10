<?php

declare(strict_types=1);

namespace App\Services\Permission;

use App\Contracts\PermissionServiceInterface;
use App\Models\Permission;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class PermissionService implements PermissionServiceInterface
{
    public function list(): Collection
    {
        return Permission::query()->latest()->get();
    }

    public function create(array $data): Permission
    {
        return DB::transaction(function () use ($data): Permission {
            return Permission::create([
                ...$data,
                'guard_name' => 'web',
            ]);
        });
    }

    public function update(Permission $permission, array $data): Permission
    {
        return DB::transaction(function () use ($permission, $data): Permission {
            $permission->update($data);

            return $permission;
        });
    }

    public function delete(Permission $permission): void
    {
        DB::transaction(fn () => $permission->delete());
    }
}
