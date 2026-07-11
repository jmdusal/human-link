<?php

declare(strict_types=1);

namespace App\Services\LeavePolicy;

use App\Contracts\LeavePolicyServiceInterface;
use App\Models\LeavePolicy;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeavePolicyService implements LeavePolicyServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = LeavePolicy::query()->latest();

        $this->companyContext->constrain($query);

        return $query->get();
    }

    public function create(array $data): LeavePolicy
    {
        return DB::transaction(function () use ($data): LeavePolicy {
            return LeavePolicy::create([
                ...$data,
                'company_id' => $data['company_id'] ?? $this->companyContext->requireId(),
                'slug' => Str::slug($data['name']),
            ]);
        });
    }

    public function update(LeavePolicy $leavePolicy, array $data): LeavePolicy
    {
        $this->assertSameCompany($leavePolicy);

        return DB::transaction(function () use ($leavePolicy, $data): LeavePolicy {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            unset($data['company_id']);

            $leavePolicy->update($data);

            return $leavePolicy;
        });
    }

    public function delete(LeavePolicy $leavePolicy): void
    {
        $this->assertSameCompany($leavePolicy);

        $leavePolicy->delete();
    }

    private function assertSameCompany(LeavePolicy $leavePolicy): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $leavePolicy->company_id !== $this->companyContext->requireId()) {
            abort(403, 'Leave policy does not belong to your company.');
        }
    }
}
