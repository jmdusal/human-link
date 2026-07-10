<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\LeaveBalance;
use Illuminate\Database\Eloquent\Collection;

interface LeaveBalanceServiceInterface
{
    public function list(): Collection;

    public function create(array $data): LeaveBalance;

    public function update(LeaveBalance $leaveBalance, array $data): LeaveBalance;

    public function delete(LeaveBalance $leaveBalance): void;
}
