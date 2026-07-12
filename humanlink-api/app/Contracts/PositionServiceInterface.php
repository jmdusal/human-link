<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Position;
use Illuminate\Database\Eloquent\Collection;

interface PositionServiceInterface
{
    public function list(?int $departmentId = null): Collection;

    public function create(array $data): Position;

    public function update(Position $position, array $data): Position;

    public function delete(Position $position): void;
}
