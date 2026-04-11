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
            'schedules-view',
            'leave-policies-view',
            'activity-logs-view',
        ]);

        $userRole->syncPermissions([
            'schedules-view',
            'leave-policies-view',
        ]);
    }
}
