<?php

declare(strict_types=1);

namespace App\Services\ContractTemplate;

use App\Contracts\ContractTemplateServiceInterface;
use App\Models\Company;
use App\Models\ContractTemplate;
use App\Support\CompanyContext;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ContractTemplateService implements ContractTemplateServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = ContractTemplate::query()->orderBy('employment_type');

        $this->companyContext->constrain($query);

        return $query->get();
    }

    public function create(array $data): ContractTemplate
    {
        return DB::transaction(function () use ($data): ContractTemplate {
            return ContractTemplate::create([
                ...$data,
                'company_id' => $data['company_id'] ?? $this->companyContext->requireId(),
            ]);
        });
    }

    public function update(ContractTemplate $contractTemplate, array $data): ContractTemplate
    {
        $this->assertSameCompany($contractTemplate);

        return DB::transaction(function () use ($contractTemplate, $data): ContractTemplate {
            unset($data['company_id']);

            $contractTemplate->update($data);

            return $contractTemplate->fresh();
        });
    }

    public function delete(ContractTemplate $contractTemplate): void
    {
        $this->assertSameCompany($contractTemplate);

        $contractTemplate->delete();
    }

    public function previewPdf(string $body): Response
    {
        $filledBody = $this->fillSamplePlaceholders($body);

        $pdf = Pdf::loadView('contracts.pdf', [
            'body' => $filledBody,
        ]);

        return $pdf->stream('contract-template-preview.pdf');
    }

    private function assertSameCompany(ContractTemplate $contractTemplate): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $contractTemplate->company_id !== $this->companyContext->requireId()) {
            abort(403, 'Contract template does not belong to your company.');
        }
    }

    private function fillSamplePlaceholders(string $body): string
    {
        $replacements = [
            '{{company_name}}' => e($this->resolveCompanyDisplayName()),
            '{{employee_name}}' => '',
            '{{email}}' => '',
            '{{job_title}}' => '',
            '{{department}}' => '',
            '{{employment_type}}' => '',
            '{{hired_at}}' => '',
            '{{monthly_rate}}' => '',
            '{{daily_rate}}' => '',
            '{{hourly_rate}}' => '',
            '{{generated_at}}' => '',
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $body);
    }

    private function resolveCompanyDisplayName(): string
    {
        $companyId = $this->companyContext->id();
        if ($companyId === null) {
            return '';
        }

        $company = Company::query()->find($companyId);
        if (! $company) {
            return '';
        }

        $name = trim((string) ($company->name ?? ''));
        if ($name !== '') {
            return $name;
        }

        return trim((string) ($company->legal_name ?? ''));
    }
}
