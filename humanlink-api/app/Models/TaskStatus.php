<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $color_hex
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereColorHex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereWorkspaceId($value)
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $workspace_id
 * @property string $name
 * @property string $color_hex
 * @property int $position
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereColorHex($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|TaskStatus whereWorkspaceId($value)
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
class TaskStatus extends Model
{
    protected $fillable = [
        'workspace_id',
        'name',
        'color_hex',
        'position',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }
}
