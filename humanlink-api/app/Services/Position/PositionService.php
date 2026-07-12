<?php

declare(strict_types=1);

namespace App\Services\Position;

use App\Contracts\PositionServiceInterface;
use App\Models\Department;
use App\Models\Position;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PositionService implements PositionServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(?int $departmentId = null): Collection
    {
        $query = Position::query()
            ->with('department:id,name,slug')
            ->latest();

        $this->companyContext->constrain($query);

        if ($departmentId !== null) {
            $query->where('department_id', $departmentId);
        }

        return $query->get();
    }

    public function create(array $data): Position
    {
        return DB::transaction(function () use ($data): Position {
            $department = $this->resolveDepartment((int) $data['department_id']);

            $position = Position::create([
                ...$data,
                'company_id' => $data['company_id'] ?? $department->company_id,
                'slug' => Str::slug($data['name']),
            ]);

            return $position->load('department:id,name,slug');
        });
    }

    public function update(Position $position, array $data): Position
    {
        $this->assertSameCompany($position);

        return DB::transaction(function () use ($position, $data): Position {
            if (isset($data['department_id'])) {
                $this->resolveDepartment((int) $data['department_id']);
            }

            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            unset($data['company_id']);

            $position->update($data);

            return $position->load('department:id,name,slug');
        });
    }

    public function delete(Position $position): void
    {
        $this->assertSameCompany($position);

        if ($position->userDetails()->exists()) {
            abort(422, 'Cannot delete a job that is assigned to users.');
        }

        $position->delete();
    }

    private function resolveDepartment(int $departmentId): Department
    {
        $query = Department::query()->whereKey($departmentId);
        $this->companyContext->constrain($query);

        $department = $query->first();

        if (! $department) {
            abort(422, 'Selected department is invalid.');
        }

        return $department;
    }

    private function assertSameCompany(Position $position): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $position->company_id !== $this->companyContext->requireId()) {
            abort(403, 'Job does not belong to your company.');
        }
    }
}
