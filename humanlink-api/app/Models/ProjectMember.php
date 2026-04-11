<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $project_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUserId($value)
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $project_id
 * @property int $user_id
 * @property string $role
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereRole($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ProjectMember whereUserId($value)
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\User $user
 * @mixin \Eloquent
 */
class ProjectMember extends Model
{
    protected $fillable = [
      'project_id',
      'user_id',
      'role',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
