<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CompanySeeder::class,
            PermissionSeeder::class,
            LeavePolicySeeder::class,
            DepartmentPositionSeeder::class,
            ContractTemplateSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            StatutoryContributionSeeder::class,
        ]);
    }
}
