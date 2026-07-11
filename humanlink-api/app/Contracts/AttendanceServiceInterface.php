<?php

declare(strict_types=1);

namespace App\Contracts;

interface AttendanceServiceInterface
{
    /**
     * @return array{data: mixed, meta: array{start: string, end: string}}
     */
    public function list(?string $start = null, ?string $end = null): array;

    /**
     * @return array<string, mixed>
     */
    public function status(): array;

    /**
     * @return array<string, mixed>
     */
    public function start(): array;

    /**
     * @return array<string, mixed>
     */
    public function pause(): array;

    /**
     * @return array<string, mixed>
     */
    public function resume(): array;

    /**
     * @return array<string, mixed>
     */
    public function end(): array;
}
