<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use App\Models\Position;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DepartmentPositionSeeder extends Seeder
{
    public function run(): void
    {
        $companyIds = Company::query()->pluck('id');

        if ($companyIds->isEmpty()) {
            return;
        }

        $catalog = [
            'Human Resources' => [
                'HR Manager',
                'HR Officer',
                'Recruiter',
                'Payroll Specialist',
            ],
            'Engineering' => [
                'Software Engineer',
                'Senior Software Engineer',
                'QA Engineer',
                'DevOps Engineer',
                'IT Support Specialist',
            ],
            'Finance' => [
                'Finance Manager',
                'Accountant',
                'Bookkeeper',
            ],
            'Operations' => [
                'Operations Manager',
                'Operations Associate',
            ],
            'Sales' => [
                'Sales Manager',
                'Sales Executive',
                'Account Manager',
            ],
            'Marketing' => [
                'Marketing Manager',
                'Marketing Specialist',
                'Content Specialist',
            ],
            'Administration' => [
                'Office Manager',
                'Admin Assistant',
                'Executive Assistant',
            ],
            'Customer Success' => [
                'Customer Success Manager',
                'Support Specialist',
            ],
        ];

        foreach ($companyIds as $companyId) {
            foreach ($catalog as $departmentName => $jobs) {
                $department = Department::updateOrCreate(
                    [
                        'company_id' => $companyId,
                        'slug' => Str::slug($departmentName),
                    ],
                    [
                        'name' => $departmentName,
                        'is_active' => true,
                    ]
                );

                foreach ($jobs as $jobName) {
                    Position::updateOrCreate(
                        [
                            'company_id' => $companyId,
                            'department_id' => $department->id,
                            'slug' => Str::slug($jobName),
                        ],
                        [
                            'name' => $jobName,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }
}
