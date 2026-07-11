<?php

namespace Database\Seeders;

use App\Support\UserTypePermissions;
use Illuminate\Database\Seeder;
use App\Models\LeavePolicy;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'user_type' => null,
            ]
        );
        $admin->syncRoles(['super-admin']);
        $admin->syncPermissions([]);

        $hr = User::updateOrCreate(
            ['email' => 'hr@user.com'],
            [
                'name' => 'HR User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
                'user_type' => 'hr',
            ]
        );
        $hr->syncRoles(['user']);
        $hr->syncPermissions(UserTypePermissions::for('hr'));
        $this->ensureLeaveBalances($hr);

        $manager = User::updateOrCreate(
            ['email' => 'manager@user.com'],
            [
                'name' => 'Team Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
                'user_type' => 'manager',
            ]
        );
        $manager->syncRoles(['user']);
        $manager->syncPermissions(UserTypePermissions::for('manager'));
        $this->ensureLeaveBalances($manager);

        $employee = User::updateOrCreate(
            ['email' => 'user@user.com'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'status' => 'active',
                'user_type' => 'employee',
            ]
        );
        $employee->syncRoles(['user']);
        $employee->syncPermissions(UserTypePermissions::for('employee'));
        $this->ensureLeaveBalances($employee);
    }

    protected function ensureLeaveBalances(User $user): void
    {
        $currentYear = (int) date('Y');

        $balances = LeavePolicy::query()
            ->where('is_active', true)
            ->get()
            ->map(fn (LeavePolicy $policy): array => [
                'leave_policy_id' => $policy->id,
                'allowed' => $policy->default_credits,
                'used' => 0.00,
                'year' => $currentYear,
            ])
            ->all();

        foreach ($balances as $balance) {
            $user->leaveBalances()->firstOrCreate(
                [
                    'leave_policy_id' => $balance['leave_policy_id'],
                    'year' => $balance['year'],
                ],
                [
                    'allowed' => $balance['allowed'],
                    'used' => $balance['used'],
                ]
            );
        }
    }
}
