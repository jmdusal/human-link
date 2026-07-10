<?php

declare(strict_types=1);

namespace App\Services\Role\Concerns;

use App\Models\Role;

trait ManagesRolePermissions
{
    protected function syncPermissions(Role $role, ?array $permissions): void
    {
        if ($permissions === null) {
            return;
        }

        $role->syncPermissions($permissions);
    }
}
