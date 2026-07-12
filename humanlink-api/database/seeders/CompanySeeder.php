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
            ['slug' => 'local-company'],
            [
                'name' => 'Local Company',
                'legal_name' => 'Local Company',
                'timezone' => 'Asia/Manila',
            ]
        );
    }
}
