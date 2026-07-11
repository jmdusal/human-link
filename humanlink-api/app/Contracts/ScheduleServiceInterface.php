<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Schedule;

interface ScheduleServiceInterface
{
    /**
     * @return array{data: \Illuminate\Database\Eloquent\Collection, meta: array{start: string, end: string}}
     */
    public function list(?string $start = null, ?string $end = null): array;

    public function show(Schedule $schedule): Schedule;

    public function create(array $data): Schedule;

    public function update(Schedule $schedule, array $data): Schedule;

    public function delete(Schedule $schedule): void;
}
