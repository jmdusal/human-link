<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\LeavePolicy;
use Illuminate\Database\Eloquent\Collection;

interface LeavePolicyServiceInterface
{
    public function list(): Collection;

    public function create(array $data): LeavePolicy;

    public function update(LeavePolicy $leavePolicy, array $data): LeavePolicy;

    public function delete(LeavePolicy $leavePolicy): void;
}
