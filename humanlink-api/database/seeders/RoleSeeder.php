<?php

namespace Database\Seeders;

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
                ->orWhere('name', 'like', 'leave-balances-%')
                ->orWhere('name', 'like', 'leave-requests-%')
                ->orWhere('name', 'like', 'leaves-%')
                ->orWhere('name', 'like', 'schedules-%')
                ->orWhere('name', 'like', 'attendances-%')
                ->orWhere('name', 'like', 'attendance-disputes-%')
                ->orWhere('name', 'like', 'payrolls-%')
                ->orWhere('name', 'like', 'payroll-deductions-%')
                ->orWhere('name', 'like', 'leave-calendar-%')
                ->orWhere('name', 'like', 'reports-%')
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
            'schedules-create',
            'schedules-edit',
            'schedules-delete',
            'leave-policies-view',
            'leave-requests-view',
            'leave-requests-create',
            'leave-requests-edit',
            'leave-requests-delete',
            'leaves-view',
            'leave-calendar-view',
            'activity-logs-view',
            'attendances-view',
            'attendances-create',
            'attendances-edit',
            'attendance-disputes-view',
            'attendance-disputes-edit',
            'payrolls-view',
            'payroll-deductions-view',
            'reports-view',
        ]);

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
            'leave-requests-view',
            'leave-requests-create',
            'leave-requests-edit',
            'leave-requests-delete',
            'leave-calendar-view',
            'leave-balances-view',
            'attendances-view',
            'attendances-create',
            'attendances-edit',
            'attendance-disputes-view',
            'attendance-disputes-create',
            'payrolls-view',
        ]);
    }
}
