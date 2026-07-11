<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\ContractTemplate;
use App\Models\User;
use App\Support\DefaultContractTemplates;
use App\Support\UserTypePermissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class ContractTemplateSeeder extends Seeder
{
    public function run(): void
    {
        foreach (DefaultContractTemplates::all() as $template) {
            ContractTemplate::updateOrCreate(
                ['employment_type' => $template['employment_type']],
                [
                    'name' => $template['name'],
                    'body' => $template['body'],
                    'is_active' => $template['is_active'],
                ]
            );
        }

        Role::findByName('super-admin')?->syncPermissions(Permission::all());

        User::query()
            ->where('user_type', 'hr')
            ->each(function (User $user): void {
                $user->syncPermissions(UserTypePermissions::for('hr'));
            });
    }
}
