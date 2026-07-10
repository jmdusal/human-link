<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Task;
use Illuminate\Database\Eloquent\Collection;

interface TaskServiceInterface
{
    public function list(): Collection;

    public function create(array $data): Task;

    public function update(Task $task, array $data): Task;

    public function updatePosition(Task $task, array $data): Task;

    public function delete(Task $task): void;
}
