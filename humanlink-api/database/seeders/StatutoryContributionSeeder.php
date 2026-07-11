<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\StatutoryContributionBracket;
use Illuminate\Database\Seeder;

class StatutoryContributionSeeder extends Seeder
{
    public function run(): void
    {
        StatutoryContributionBracket::query()->delete();

        $effective = '2025-01-01';

        // Simplified SSS MSC brackets (regular EE/ER share approx for MVP).
        $sssRows = [
            [0, 5249.99, 250.00, 500.00],
            [5250, 5749.99, 275.00, 550.00],
            [5750, 6249.99, 300.00, 600.00],
            [6250, 6749.99, 325.00, 650.00],
            [6750, 7249.99, 350.00, 700.00],
            [7250, 7749.99, 375.00, 750.00],
            [7750, 8249.99, 400.00, 800.00],
            [8250, 8749.99, 425.00, 850.00],
            [8750, 9249.99, 450.00, 900.00],
            [9250, 9749.99, 475.00, 950.00],
            [9750, 10249.99, 500.00, 1000.00],
            [10250, 10749.99, 525.00, 1050.00],
            [10750, 11249.99, 550.00, 1100.00],
            [11250, 11749.99, 575.00, 1150.00],
            [11750, 12249.99, 600.00, 1200.00],
            [12250, 12749.99, 625.00, 1250.00],
            [12750, 13249.99, 650.00, 1300.00],
            [13250, 13749.99, 675.00, 1350.00],
            [13750, 14249.99, 700.00, 1400.00],
            [14250, 14749.99, 725.00, 1450.00],
            [14750, 15249.99, 750.00, 1500.00],
            [15250, 15749.99, 775.00, 1550.00],
            [15750, 16249.99, 800.00, 1600.00],
            [16250, 16749.99, 825.00, 1650.00],
            [16750, 17249.99, 850.00, 1700.00],
            [17250, 17749.99, 875.00, 1750.00],
            [17750, 18249.99, 900.00, 1800.00],
            [18250, 18749.99, 925.00, 1850.00],
            [18750, 19249.99, 950.00, 1900.00],
            [19250, 19749.99, 975.00, 1950.00],
            [19750, null, 1000.00, 2000.00],
        ];

        $rows = [];

        foreach ($sssRows as [$min, $max, $ee, $er]) {
            $rows[] = [
                'agency' => 'sss',
                'effective_date' => $effective,
                'min_compensation' => $min,
                'max_compensation' => $max,
                'employee_amount' => $ee,
                'employer_amount' => $er,
                'employee_rate' => null,
                'employer_rate' => null,
                'base_amount' => null,
                'meta' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        $rows[] = [
            'agency' => 'philhealth',
            'effective_date' => $effective,
            'min_compensation' => 0,
            'max_compensation' => null,
            'employee_amount' => null,
            'employer_amount' => null,
            'employee_rate' => 0.05,
            'employer_rate' => 0.05,
            'base_amount' => null,
            'meta' => json_encode(['floor' => 10000, 'ceiling' => 100000, 'ee_share' => 0.5]),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $rows[] = [
            'agency' => 'pagibig',
            'effective_date' => $effective,
            'min_compensation' => 0,
            'max_compensation' => 1500,
            'employee_amount' => null,
            'employer_amount' => null,
            'employee_rate' => 0.01,
            'employer_rate' => 0.02,
            'base_amount' => null,
            'meta' => json_encode(['ceiling' => 10000]),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        $rows[] = [
            'agency' => 'pagibig',
            'effective_date' => $effective,
            'min_compensation' => 1500.01,
            'max_compensation' => null,
            'employee_amount' => null,
            'employer_amount' => null,
            'employee_rate' => 0.02,
            'employer_rate' => 0.02,
            'base_amount' => null,
            'meta' => json_encode(['ceiling' => 10000]),
            'created_at' => now(),
            'updated_at' => now(),
        ];

        // TRAIN monthly withholding tax (simplified).
        $taxRows = [
            [0, 20833.00, 0, 0, 0],
            [20833.01, 33332.00, 0, 0.15, 20833],
            [33333.00, 66666.00, 1875.00, 0.20, 33333],
            [66667.00, 166666.00, 8541.80, 0.25, 66667],
            [166667.00, 666666.00, 33541.80, 0.30, 166667],
            [666667.00, null, 183541.80, 0.35, 666667],
        ];

        foreach ($taxRows as [$min, $max, $base, $rate, $excessOver]) {
            $rows[] = [
                'agency' => 'withholding_tax',
                'effective_date' => $effective,
                'min_compensation' => $min,
                'max_compensation' => $max,
                'employee_amount' => null,
                'employer_amount' => null,
                'employee_rate' => $rate,
                'employer_rate' => null,
                'base_amount' => $base,
                'meta' => json_encode(['excess_over' => $excessOver]),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        StatutoryContributionBracket::query()->insert($rows);
    }
}
