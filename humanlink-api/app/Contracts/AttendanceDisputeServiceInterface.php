<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\AttendanceDispute;
use Illuminate\Database\Eloquent\Collection;

interface AttendanceDisputeServiceInterface
{
    public function list(): Collection;

    public function create(array $data): AttendanceDispute;

    public function approve(AttendanceDispute $dispute, array $data = []): AttendanceDispute;

    public function reject(AttendanceDispute $dispute, array $data = []): AttendanceDispute;
}
