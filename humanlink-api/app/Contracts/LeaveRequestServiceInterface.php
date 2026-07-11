<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Collection;

interface LeaveRequestServiceInterface
{
    public function list(): Collection;

    public function listPolicyOptions(): Collection;

    /**
     * @return array{data: Collection<int, LeaveRequest>, meta: array{start: string, end: string}}
     */
    public function calendar(?string $start = null, ?string $end = null, ?string $status = null): array;

    /**
     * @return array<int, array{id: int, user: array{id: int, name: string}, start_date: string, end_date: string, status: string, policy: string|null}>
     */
    public function conflicts(LeaveRequest $leaveRequest): array;

    public function show(LeaveRequest $leaveRequest): LeaveRequest;

    public function create(array $data): LeaveRequest;

    public function update(LeaveRequest $leaveRequest, array $data): LeaveRequest;

    public function approve(LeaveRequest $leaveRequest, ?string $comment = null): LeaveRequest;

    public function reject(LeaveRequest $leaveRequest, ?string $comment = null): LeaveRequest;

    public function cancel(LeaveRequest $leaveRequest): LeaveRequest;

    public function delete(LeaveRequest $leaveRequest): void;
}
