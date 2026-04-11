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
            PermissionSeeder::class,
            LeavePolicySeeder::class,
            RoleSeeder::class,
            UserSeeder::class
        ]);

        // $adminRole = Role::create(['name' => 'admin']);
        // $userRole = Role::create(['name' => 'user']);

        // $adminRole->givePermissionTo(Permission::all());

        // $admin = User::factory()->create([
        //     'name' => 'Admin User',
        //     'email' => 'admin@admin.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $admin->assignRole($adminRole);

        // $user = User::factory()->create([
        //     'name' => 'Regular User',
        //     'email' => 'user@user.com',
        //     'password' => Hash::make('password'),
        // ]);
        // $user->assignRole($userRole);
    }
}
