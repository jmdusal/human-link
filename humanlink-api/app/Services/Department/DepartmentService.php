<?php

declare(strict_types=1);

namespace App\Services\Department;

use App\Contracts\DepartmentServiceInterface;
use App\Models\Department;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DepartmentService implements DepartmentServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = Department::query()
            ->withCount('positions')
            ->latest();

        $this->companyContext->constrain($query);

        return $query->get();
    }

    public function create(array $data): Department
    {
        return DB::transaction(function () use ($data): Department {
            return Department::create([
                ...$data,
                'company_id' => $data['company_id'] ?? $this->companyContext->requireId(),
                'slug' => Str::slug($data['name']),
            ]);
        });
    }

    public function update(Department $department, array $data): Department
    {
        $this->assertSameCompany($department);

        return DB::transaction(function () use ($department, $data): Department {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            unset($data['company_id']);

            $department->update($data);

            return $department->loadCount('positions');
        });
    }

    public function delete(Department $department): void
    {
        $this->assertSameCompany($department);

        if ($department->positions()->exists()) {
            abort(422, 'Cannot delete a department that still has jobs. Remove or reassign jobs first.');
        }

        if ($department->userDetails()->exists()) {
            abort(422, 'Cannot delete a department that is assigned to users.');
        }

        $department->delete();
    }

    private function assertSameCompany(Department $department): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $department->company_id !== $this->companyContext->requireId()) {
            abort(403, 'Department does not belong to your company.');
        }
    }
}
