<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = Role::updateOrCreate(['name' => 'super-admin']);
        $hrManager  = Role::updateOrCreate(['name' => 'hr-manager']);
        $manager    = Role::updateOrCreate(['name' => 'manager']);
        $userRole   = Role::updateOrCreate(['name' => 'user']);

        $superAdmin->syncPermissions(Permission::all());

        $hrManager->syncPermissions(
            Permission::where('name', 'like', 'users-%')
                ->orWhere('name', 'like', 'roles-%')
                ->orWhere('name', 'like', 'permissions-%')
                ->orWhere('name', 'like', 'leave-policies-%')
                ->orWhere('name', 'like', 'schedules-%')
                ->get()
        );

        $manager->syncPermissions([
            'users-view',
            'workspaces-view',
            'workspaces-create',
            'workspaces-edit',
            'projects-view',
            'projects-create',
            'projects-edit',
            'tasks-view',
            'tasks-create',
            'tasks-edit',
            'schedules-view',
            'leave-policies-view',
            'activity-logs-view',
        ]);

        // Workspace members use the same login; access is scoped by workspace/project membership.
        $userRole->syncPermissions([
            'workspaces-view',
            'projects-view',
            'projects-create',
            'projects-edit',
            'projects-delete',
            'tasks-view',
            'tasks-create',
            'tasks-edit',
            'schedules-view',
            'leave-policies-view',
        ]);
    }
}
