<?php

declare(strict_types=1);

namespace App\Services\ContractTemplate;

use App\Contracts\ContractTemplateServiceInterface;
use App\Models\ContractTemplate;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ContractTemplateService implements ContractTemplateServiceInterface
{
    public function list(): Collection
    {
        return ContractTemplate::query()
            ->orderBy('employment_type')
            ->get();
    }

    public function create(array $data): ContractTemplate
    {
        return DB::transaction(function () use ($data): ContractTemplate {
            return ContractTemplate::create($data);
        });
    }

    public function update(ContractTemplate $contractTemplate, array $data): ContractTemplate
    {
        return DB::transaction(function () use ($contractTemplate, $data): ContractTemplate {
            $contractTemplate->update($data);

            return $contractTemplate->fresh();
        });
    }

    public function delete(ContractTemplate $contractTemplate): void
    {
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

    private function fillSamplePlaceholders(string $body): string
    {
        $replacements = [
            '{{employee_name}}' => e('Alex Rivera'),
            '{{email}}' => e('alex.rivera@example.com'),
            '{{job_title}}' => e('Software Engineer'),
            '{{department}}' => e('Engineering'),
            '{{employment_type}}' => e('Regular'),
            '{{hired_at}}' => e(now()->format('F j, Y')),
            '{{monthly_rate}}' => e('75,000.00'),
            '{{daily_rate}}' => e('3,409.09'),
            '{{hourly_rate}}' => e('426.14'),
            '{{generated_at}}' => e(now()->format('F j, Y')),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $body);
    }
}
