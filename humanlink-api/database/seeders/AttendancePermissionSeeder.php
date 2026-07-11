<?php

declare(strict_types=1);

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AttendancePermissionSeeder extends Seeder
{
    public function run(): void
    {
        collect(['view', 'create', 'edit', 'delete'])->each(function (string $action): void {
            Permission::updateOrCreate(['name' => "attendances-{$action}"]);
        });

        Role::findByName('super-admin')?->givePermissionTo(Permission::all());
    }
}
