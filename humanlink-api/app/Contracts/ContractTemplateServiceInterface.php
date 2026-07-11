<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\ContractTemplate;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpFoundation\Response;

interface ContractTemplateServiceInterface
{
    public function list(): Collection;

    public function create(array $data): ContractTemplate;

    public function update(ContractTemplate $contractTemplate, array $data): ContractTemplate;

    public function delete(ContractTemplate $contractTemplate): void;

    public function previewPdf(string $body): Response;
}
