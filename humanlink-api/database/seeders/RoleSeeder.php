<?php

namespace Database\Seeders;

use App\Support\UserTypePermissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = Role::updateOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);
        $userRole = Role::updateOrCreate(['name' => 'user', 'guard_name' => 'web']);

        $superAdmin->syncPermissions(Permission::all());

        // Base role keeps no fixed pack — permissions are synced from user_type on each user.
        $userRole->syncPermissions([]);

        $this->reassignLegacyRoles();
        $this->deleteLegacyRoles();
        $this->syncAllUserTypePermissions();

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }

    protected function reassignLegacyRoles(): void
    {
        $legacyRoleIds = Role::query()
            ->whereIn('name', ['hr-manager', 'manager'])
            ->pluck('id');

        if ($legacyRoleIds->isEmpty()) {
            return;
        }

        $modelHasRoles = config('permission.table_names.model_has_roles');
        $userRole = Role::findByName('user');

        $userIds = DB::table($modelHasRoles)
            ->whereIn('role_id', $legacyRoleIds)
            ->where('model_type', \App\Models\User::class)
            ->pluck('model_id')
            ->unique();

        foreach ($userIds as $userId) {
            $user = \App\Models\User::query()->find($userId);
            if (! $user) {
                continue;
            }

            if ($user->hasRole('super-admin')) {
                continue;
            }

            $hadHrManager = $user->hasRole('hr-manager');

            if ($hadHrManager && $user->user_type === null) {
                $user->user_type = 'hr';
                $user->save();
            }

            $user->syncRoles([$userRole]);
        }
    }

    protected function deleteLegacyRoles(): void
    {
        Role::query()
            ->whereIn('name', ['hr-manager', 'manager'])
            ->delete();
    }

    protected function syncAllUserTypePermissions(): void
    {
        \App\Models\User::query()
            ->with('assignedUserType.permissions:id,name')
            ->whereDoesntHave('roles', function ($query): void {
                $query->where('name', 'super-admin');
            })
            ->each(function (\App\Models\User $user): void {
                if (! $user->hasRole('user')) {
                    $user->assignRole('user');
                }

                $permissionNames = $user->assignedUserType?->permissions
                    ?->pluck('name')
                    ->all()
                    ?? UserTypePermissions::for($user->user_type);

                $user->syncPermissions($permissionNames);
            });
    }
}
