<?php

declare(strict_types=1);

namespace App\Services\IdCardTemplate;

use App\Contracts\IdCardTemplateServiceInterface;
use App\Models\Company;
use App\Models\IdCardTemplate;
use App\Support\CompanyContext;
use App\Support\HtmlToPng;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class IdCardTemplateService implements IdCardTemplateServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = IdCardTemplate::query()->orderBy('name');

        $this->companyContext->constrain($query);

        return $query->get();
    }

    public function create(array $data): IdCardTemplate
    {
        return DB::transaction(function () use ($data): IdCardTemplate {
            return IdCardTemplate::create([
                ...$data,
                'company_id' => $data['company_id'] ?? $this->companyContext->requireId(),
            ]);
        });
    }

    public function update(IdCardTemplate $idCardTemplate, array $data): IdCardTemplate
    {
        $this->assertSameCompany($idCardTemplate);

        return DB::transaction(function () use ($idCardTemplate, $data): IdCardTemplate {
            unset($data['company_id']);

            $idCardTemplate->update($data);

            return $idCardTemplate->fresh();
        });
    }

    public function delete(IdCardTemplate $idCardTemplate): void
    {
        $this->assertSameCompany($idCardTemplate);

        $idCardTemplate->delete();
    }

    public function previewPdf(string $body): Response
    {
        $filledBody = $this->fillSamplePlaceholders($body);

        $pdf = Pdf::loadView('id-cards.pdf', [
            'body' => $filledBody,
        ])->setPaper([0, 0, 460, 290]);

        $pngBinary = HtmlToPng::trimWhitespace(
            HtmlToPng::fromPdfBinary($pdf->output())
        );

        return response($pngBinary, 200, [
            'Content-Type' => 'image/png',
            'Content-Disposition' => 'inline; filename="id-card-template-preview.png"',
        ]);
    }

    private function assertSameCompany(IdCardTemplate $idCardTemplate): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $idCardTemplate->company_id !== $this->companyContext->requireId()) {
            abort(403, 'ID card template does not belong to your company.');
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
            '{{generated_at}}' => '',
            '{{initials}}' => 'AA',
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
