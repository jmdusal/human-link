<?php

declare(strict_types=1);

namespace App\Contracts;

interface DashboardServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function summary(): array;
}
