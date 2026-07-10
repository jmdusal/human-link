<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface TaskAttachmentServiceInterface
{
    public function list(Task $task): Collection;

    public function create(Task $task, UploadedFile $file): TaskAttachment;

    public function delete(TaskAttachment $attachment): void;
}
