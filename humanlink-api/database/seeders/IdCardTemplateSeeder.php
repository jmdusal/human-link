<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Contracts\UserTypeServiceInterface;
use App\Models\Company;
use App\Models\IdCardTemplate;
use App\Support\DefaultIdCardTemplates;
use Illuminate\Database\Seeder;

class IdCardTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $companies = Company::query()->get();

        if ($companies->isEmpty()) {
            return;
        }

        $template = DefaultIdCardTemplates::default();
        $userTypeService = app(UserTypeServiceInterface::class);

        foreach ($companies as $company) {
            IdCardTemplate::updateOrCreate(
                [
                    'company_id' => $company->id,
                ],
                [
                    'name' => $template['name'],
                    'body' => $template['body'],
                    'is_active' => $template['is_active'],
                ]
            );

            // This is necessary to ensure the id-card-templates are available to the users.
            $userTypeService->provisionDefaults($company);
        }
    }
}
