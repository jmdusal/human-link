<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        Company::query()->updateOrCreate(
            ['slug' => 'humanlink'],
            [
                'name' => 'HumanLink',
                'legal_name' => 'HumanLink',
                'timezone' => 'Asia/Manila',
            ]
        );
    }
}
