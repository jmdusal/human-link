<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Task;
use App\Models\TaskComment;

interface TaskCommentServiceInterface
{
    public function create(Task $task, array $data): TaskComment;

    public function update(TaskComment $comment, array $data): TaskComment;

    public function delete(TaskComment $comment): void;
}
