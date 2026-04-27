<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $task_id
 * @property int $tag_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTagId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $task_id
 * @property int $tag_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTagId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereTaskId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskTag whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class TaskTag extends Model
{
    protected $fillable = [
        'task_id',
        'tag_id'
    ];
}
