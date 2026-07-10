<?php

declare(strict_types=1);

namespace App\Services\LeavePolicy;

use App\Contracts\LeavePolicyServiceInterface;
use App\Models\LeavePolicy;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LeavePolicyService implements LeavePolicyServiceInterface
{
    public function list(): Collection
    {
        return LeavePolicy::query()->latest()->get();
    }

    public function create(array $data): LeavePolicy
    {
        return DB::transaction(function () use ($data): LeavePolicy {
            return LeavePolicy::create([
                ...$data,
                'slug' => Str::slug($data['name']),
            ]);
        });
    }

    public function update(LeavePolicy $leavePolicy, array $data): LeavePolicy
    {
        return DB::transaction(function () use ($leavePolicy, $data): LeavePolicy {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }

            $leavePolicy->update($data);

            return $leavePolicy;
        });
    }

    public function delete(LeavePolicy $leavePolicy): void
    {
        $leavePolicy->delete();
    }
}
