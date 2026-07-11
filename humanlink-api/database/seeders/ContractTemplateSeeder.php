<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Company;
use App\Models\ContractTemplate;
use App\Support\DefaultContractTemplates;
use Illuminate\Database\Seeder;

class ContractTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $companyId = Company::query()->where('slug', 'humanlink')->value('id');

        if (! $companyId) {
            return;
        }

        foreach (DefaultContractTemplates::all() as $template) {
            ContractTemplate::updateOrCreate(
                [
                    'company_id' => $companyId,
                    'employment_type' => $template['employment_type'],
                ],
                [
                    'name' => $template['name'],
                    'body' => $template['body'],
                    'is_active' => $template['is_active'],
                ]
            );
        }
    }
}
