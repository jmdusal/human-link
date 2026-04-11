<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $type
 * @property string|null $old_value
 * @property string|null $new_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereNewValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereOldValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $task_id
 * @property int $user_id
 * @property string $type
 * @property string|null $old_value
 * @property string|null $new_value
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereNewValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereOldValue($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskActivity whereUserId($value)
 * @property-read \App\Models\Task|null $task
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
class TaskActivity extends Model
{
    protected $fillable = [
        'task_id',
        'user_id',
        'type',
        'old_value',
        'new_value'
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
