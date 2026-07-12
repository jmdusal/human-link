<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\LeavePolicy;
use App\Models\User;
use App\Models\UserType;
use App\Support\UserTypePermissions;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::query()->where('slug', 'local-company')->value('id');

        if (! $companyId) {
            return;
        }

        $typeIds = UserType::query()
            ->where('company_id', $companyId)
            ->pluck('id', 'slug');

        $admin = User::updateOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'company_id' => $companyId,
                'name' => 'Admin User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_set_password' => false,
                'is_active' => true,
                'status' => 'active',
                'user_type' => null,
                'user_type_id' => null,
            ]
        );
        $admin->syncRoles(['super-admin']);
        $admin->syncPermissions([]);

        $hr = User::updateOrCreate(
            ['email' => 'hr@user.com'],
            [
                'company_id' => $companyId,
                'name' => 'HR User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_set_password' => false,
                'is_active' => true,
                'status' => 'active',
                'user_type' => 'hr',
                'user_type_id' => $typeIds['hr'] ?? null,
            ]
        );
        $hr->syncRoles(['user']);
        $hr->syncPermissions(UserTypePermissions::for('hr'));
        $this->ensureLeaveBalances($hr);

        $manager = User::updateOrCreate(
            ['email' => 'manager@user.com'],
            [
                'company_id' => $companyId,
                'name' => 'Team Manager',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_set_password' => false,
                'is_active' => true,
                'status' => 'active',
                'user_type' => 'manager',
                'user_type_id' => $typeIds['manager'] ?? null,
            ]
        );
        $manager->syncRoles(['user']);
        $manager->syncPermissions(UserTypePermissions::for('manager'));
        $this->ensureLeaveBalances($manager);

        $employee = User::updateOrCreate(
            ['email' => 'user@user.com'],
            [
                'company_id' => $companyId,
                'name' => 'Regular User',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'must_set_password' => false,
                'is_active' => true,
                'status' => 'active',
                'user_type' => 'employee',
                'user_type_id' => $typeIds['employee'] ?? null,
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
            ->where('company_id', $user->company_id)
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
