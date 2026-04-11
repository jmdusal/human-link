<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LeavePolicy;

class LeavePolicySeeder extends Seeder
{
    public function run(): void
    {
        $policies = [
            // --- MANDATORY STATUTORY ---
            ['name' => 'Service Incentive Leave', 'slug' => 'sil', 'default_credits' => 5.00, 'is_cashable' => true, 'requires_attachment' => false],
            ['name' => 'Maternity Leave', 'slug' => 'maternity', 'default_credits' => 105.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Paternity Leave', 'slug' => 'paternity', 'default_credits' => 7.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Solo Parent Leave', 'slug' => 'solo-parent', 'default_credits' => 7.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'VAWC Leave', 'slug' => 'vawc', 'default_credits' => 10.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Special Leave (Magna Carta)', 'slug' => 'magna-carta', 'default_credits' => 60.00, 'is_paid' => true, 'requires_attachment' => true],

            // --- STANDARD CORPORATE ---
            ['name' => 'Vacation Leave', 'slug' => 'vacation', 'default_credits' => 12.00, 'allow_carry_over' => true, 'max_carry_over' => 5.00],
            ['name' => 'Sick Leave', 'slug' => 'sick', 'default_credits' => 12.00, 'is_cashable' => true, 'requires_attachment' => true],
            ['name' => 'Bereavement Leave', 'slug' => 'bereavement', 'default_credits' => 3.00, 'is_paid' => true, 'requires_attachment' => true],

            // --- MODERN SAAS PERKS ---
            ['name' => 'Emergency Leave', 'slug' => 'emergency', 'default_credits' => 3.00, 'is_paid' => true, 'requires_attachment' => false],
            ['name' => 'Calamity Leave', 'slug' => 'calamity', 'default_credits' => 2.00, 'is_paid' => true, 'requires_attachment' => false],
            ['name' => 'Birthday Leave', 'slug' => 'birthday', 'default_credits' => 1.00, 'is_paid' => true, 'requires_attachment' => false],
            ['name' => 'Wedding Leave', 'slug' => 'wedding', 'default_credits' => 3.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Mental Health Day', 'slug' => 'wellness', 'default_credits' => 1.00, 'is_paid' => true, 'requires_attachment' => false],
        ];

        foreach ($policies as $policy) {
            LeavePolicy::updateOrCreate(['slug' => $policy['slug']], $policy);
        }
    }
}
