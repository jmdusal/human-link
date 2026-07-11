<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Company;
use Illuminate\Database\Eloquent\Collection;

interface CompanyServiceInterface
{
    public function list(): Collection;

    public function current(): Company;

    public function find(int $id): Company;

    public function create(array $data): Company;

    public function update(Company $company, array $data): Company;

    public function switchTo(int $companyId): Company;
}
