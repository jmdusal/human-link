<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\IdCardTemplate;
use Illuminate\Database\Eloquent\Collection;
use Symfony\Component\HttpFoundation\Response;

interface IdCardTemplateServiceInterface
{
    public function list(): Collection;

    public function create(array $data): IdCardTemplate;

    public function update(IdCardTemplate $idCardTemplate, array $data): IdCardTemplate;

    public function delete(IdCardTemplate $idCardTemplate): void;

    public function previewPdf(string $body): Response;
}
