<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $workspace_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereWorkspaceId($value)
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $workspace_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|WorkspaceUser whereWorkspaceId($value)
 * @property-read \App\Models\User $user
 * @property-read \App\Models\Workspace $workspace
 * @mixin \Eloquent
 */
class WorkspaceUser extends Model
{
    protected $fillable = [
        'workspace_id',
        'user_id',
        'role',
    ];

    public function workspace(): BelongsTo
    {
        return $this->belongsTo(Workspace::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
