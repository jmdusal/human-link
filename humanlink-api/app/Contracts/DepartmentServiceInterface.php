<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Department;
use Illuminate\Database\Eloquent\Collection;

interface DepartmentServiceInterface
{
    public function list(): Collection;

    public function create(array $data): Department;

    public function update(Department $department, array $data): Department;

    public function delete(Department $department): void;
}
