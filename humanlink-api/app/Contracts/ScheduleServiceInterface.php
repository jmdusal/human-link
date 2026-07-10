<?php

declare(strict_types=1);

namespace App\Contracts;

interface ScheduleServiceInterface
{
    /**
     * @return array{data: \Illuminate\Database\Eloquent\Collection, meta: array{start: string, end: string}}
     */
    public function list(?string $start = null, ?string $end = null): array;
}
