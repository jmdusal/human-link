<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskAssignment whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
class TaskAssignment extends Model
{
    protected $fillable = [
        'task_id',
        'user_id'
    ];

    public function task(): BelongsTo
    {
        return $this->belongsTo(Task::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

}
