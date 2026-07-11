<?php

declare(strict_types=1);

namespace App\Services\Company;

use App\Contracts\CompanyServiceInterface;
use App\Models\Company;
use App\Models\ContractTemplate;
use App\Models\LeavePolicy;
use App\Support\CompanyContext;
use App\Support\DefaultContractTemplates;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class CompanyService implements CompanyServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        // Platform admins always see every company (for switcher / settings).
        if ($this->companyContext->isPlatformAdmin()) {
            return Company::query()->orderBy('name')->get();
        }

        return Company::query()
            ->whereKey($this->companyContext->requireId())
            ->orderBy('name')
            ->get();
    }

    public function current(): Company
    {
        return $this->find($this->companyContext->requireId());
    }

    public function find(int $id): Company
    {
        $query = Company::query()->whereKey($id);

        if (! $this->companyContext->isPlatformAdmin()) {
            $query->whereKey($this->companyContext->requireId());
        }

        return $query->firstOrFail();
    }

    public function create(array $data): Company
    {
        if (! $this->companyContext->isPlatformAdmin()) {
            throw new AccessDeniedHttpException('Only platform admins can create companies.');
        }

        return DB::transaction(function () use ($data): Company {
            $company = Company::query()->create([
                'name' => $data['name'],
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'legal_name' => $data['legal_name'] ?? null,
                'address' => $data['address'] ?? null,
                'timezone' => $data['timezone'] ?? 'Asia/Manila',
            ]);

            $this->seedCompanyDefaults($company);

            return $company->fresh();
        });
    }

    public function update(Company $company, array $data): Company
    {
        $this->assertCanManage($company);

        return DB::transaction(function () use ($company, $data): Company {
            if (isset($data['name']) && empty($data['slug'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            $payload = array_intersect_key($data, array_flip([
                'name',
                'slug',
                'legal_name',
                'address',
                'timezone',
                'mail_mailer',
                'mail_host',
                'mail_port',
                'mail_username',
                'mail_encryption',
                'mail_from_address',
                'mail_from_name',
            ]));

            if (array_key_exists('mail_password', $data)) {
                if (filled($data['mail_password'])) {
                    $payload['mail_password'] = $data['mail_password'];
                }
            }

            if (array_key_exists('mail_port', $payload) && $payload['mail_port'] === '') {
                $payload['mail_port'] = null;
            }

            $company->update($payload);

            return $company->fresh();
        });
    }

    public function switchTo(int $companyId): Company
    {
        if (! $this->companyContext->isPlatformAdmin()) {
            throw new AccessDeniedHttpException('Only platform admins can switch companies.');
        }

        $user = $this->companyContext->user();

        if (! $user) {
            throw new AccessDeniedHttpException('Unauthenticated.');
        }

        $company = Company::query()->findOrFail($companyId);

        $user->forceFill(['company_id' => $company->id])->save();

        return $company->fresh();
    }

    private function assertCanManage(Company $company): void
    {
        if ($this->companyContext->isPlatformAdmin()) {
            return;
        }

        if ((int) $company->id !== $this->companyContext->requireId()) {
            throw new AccessDeniedHttpException('You can only manage your own company.');
        }
    }

    private function seedCompanyDefaults(Company $company): void
    {
        $defaultPolicies = [
            ['name' => 'Service Incentive Leave', 'slug' => 'sil', 'default_credits' => 5.00, 'is_cashable' => true, 'requires_attachment' => false],
            ['name' => 'Maternity Leave', 'slug' => 'maternity', 'default_credits' => 105.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Paternity Leave', 'slug' => 'paternity', 'default_credits' => 7.00, 'is_paid' => true, 'requires_attachment' => true],
            ['name' => 'Vacation Leave', 'slug' => 'vacation', 'default_credits' => 12.00, 'allow_carry_over' => true, 'max_carry_over' => 5.00],
            ['name' => 'Sick Leave', 'slug' => 'sick', 'default_credits' => 12.00, 'is_cashable' => true, 'requires_attachment' => true],
            ['name' => 'Emergency Leave', 'slug' => 'emergency', 'default_credits' => 3.00, 'is_paid' => true, 'requires_attachment' => false],
        ];

        foreach ($defaultPolicies as $policy) {
            LeavePolicy::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'slug' => $policy['slug'],
                ],
                [
                    ...$policy,
                    'company_id' => $company->id,
                    'is_active' => true,
                ]
            );
        }

        foreach (DefaultContractTemplates::all() as $template) {
            ContractTemplate::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
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
