<?php

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $owner_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereUpdatedAt($value)
 * @property-read \App\Models\User $owner
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskStatus> $taskStatuses
 * @property-read int|null $task_statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $members
 * @property-read int|null $members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Status> $statuses
 * @property-read int|null $statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $acceptedMembers
 * @property-read int|null $accepted_members_count
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereArchivedAt($value)
 * @property int $company_id
 * @property-read \App\Models\Company $company
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCompanyId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property int $owner_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereOwnerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereUpdatedAt($value)
 * @property-read \App\Models\User $owner
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskStatus> $taskStatuses
 * @property-read int|null $task_statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Project> $projects
 * @property-read int|null $projects_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $members
 * @property-read int|null $members_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Status> $statuses
 * @property-read int|null $statuses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $acceptedMembers
 * @property-read int|null $accepted_members_count
 * @property \Illuminate\Support\Carbon|null $archived_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace active()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereArchivedAt($value)
 * @property int $company_id
 * @property-read \App\Models\Company $company
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Workspace whereCompanyId($value)
 * @mixin \Eloquent
 */
class Workspace extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'owner_id',
        'archived_at',
    ];

    protected function casts(): array
    {
        return [
            'archived_at' => 'datetime',
        ];
    }

    public function scopeActive($query)
    {
        return $query->whereNull('archived_at');
    }

    public function isArchived(): bool
    {
        return $this->archived_at !== null;
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id')
                ->select(['id', 'name', 'email', 'status']);
    }

    public function taskStatuses(): HasMany
    {
        return $this->hasMany(TaskStatus::class)
            ->select(['id', 'workspace_id', 'name', 'color_hex', 'position']);
    }

    public function statuses(): HasMany
    {
        return $this->hasMany(Status::class)->select(['id', 'workspace_id', 'name', 'color_hex', 'position'])->orderBy('position', 'asc');
    }

    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'workspace_users')
            ->select(['users.id', 'users.name', 'users.email', 'users.status'])
            ->withPivot(['role', 'status', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    public function acceptedMembers(): BelongsToMany
    {
        return $this->members()->wherePivot('status', WorkspaceUser::STATUS_ACCEPTED);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    // protected static function booted()
    // {
    //     static::creating(function ($workspace) {
    //         $workspace->slug = Str::slug($workspace->name);
    //         $workspace->owner_id = auth()->id();
    //     });
    // }
}
