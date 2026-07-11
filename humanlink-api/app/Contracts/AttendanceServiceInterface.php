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
     * @param  array{latitude?: float|null, longitude?: float|null}  $location
     * @return array<string, mixed>
     */
    public function start(array $location = []): array;

    /**
     * @return array<string, mixed>
     */
    public function pause(): array;

    /**
     * @return array<string, mixed>
     */
    public function resume(): array;

    /**
     * @param  array{latitude?: float|null, longitude?: float|null}  $location
     * @return array<string, mixed>
     */
    public function end(array $location = []): array;
}
