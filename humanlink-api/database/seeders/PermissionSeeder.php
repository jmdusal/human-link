<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

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
            'activity-logs',
            'schedules'
        ];

        collect($models)->each(function ($model) {
            if (in_array($model, ['activity-log', 'schedule', 'leave'])) {
                Permission::updateOrCreate(['name' => "{$model}-view"]);
                return;
            }

            collect(['view', 'create', 'edit', 'delete'])->each(function ($action) use ($model) {
                Permission::updateOrCreate(['name' => "{$model}-{$action}"]);
            });
        });
    }
}
