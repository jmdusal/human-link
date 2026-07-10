<?php

declare(strict_types=1);

namespace App\Services\TaskAttachment;

use App\Contracts\TaskAttachmentServiceInterface;
use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class TaskAttachmentService implements TaskAttachmentServiceInterface
{
    public function list(Task $task): Collection
    {
        return $task->attachments()->with('user:id,name')->get();
    }

    public function create(Task $task, UploadedFile $file): TaskAttachment
    {
        return DB::transaction(function () use ($task, $file): TaskAttachment {
            $path = $file->store("task-attachments/{$task->id}", 'public');

            return $task->attachments()->create([
                'user_id' => Auth::id(),
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType() ?? 'image/jpeg',
                'file_size' => $file->getSize(),
            ])->load('user:id,name');
        });
    }

    public function delete(TaskAttachment $attachment): void
    {
        DB::transaction(function () use ($attachment): void {
            Storage::disk('public')->delete($attachment->file_path);
            $attachment->delete();
        });
    }
}
