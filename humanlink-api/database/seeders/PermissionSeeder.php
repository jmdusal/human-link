<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $models = [
            'users',
            'roles',
            'permissions',
            'workspaces',
            'projects',
            'tasks',
            'leaves',
            'leave-balances',
            'leave-policies',
            'contract-templates',
            'leave-requests',
            'activity-logs',
            'schedules',
            'attendances',
            'attendance-disputes',
            'payrolls',
            'payroll-deductions',
            'leave-calendar',
            'reports',
        ];

        collect($models)->each(function ($model) {
            if (in_array($model, ['activity-logs', 'leaves', 'leave-calendar', 'reports'], true)) {
                Permission::updateOrCreate(['name' => "{$model}-view"]);
                return;
            }

            collect(['view', 'create', 'edit', 'delete'])->each(function ($action) use ($model) {
                Permission::updateOrCreate(['name' => "{$model}-{$action}"]);
            });
        });

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}
