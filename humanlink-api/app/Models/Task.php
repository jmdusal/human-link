<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $project_id
 * @property int $status_id
 * @property int|null $parent_id
 * @property int $creator_id
 * @property string $title
 * @property string|null $description
 * @property string $priority
 * @property float $position
 * @property string|null $due_date
 * @property int|null $estimate_minutes
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereEstimateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereStatusId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskActivity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $assignees
 * @property-read int|null $assignees_count
 * @property-read \App\Models\User $creator
 * @property-read Task|null $parent
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\TaskStatus $status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Task> $subtasks
 * @property-read int|null $subtasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withoutTrashed()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $project_id
 * @property int $status_id
 * @property int|null $parent_id
 * @property int $creator_id
 * @property string $title
 * @property string|null $description
 * @property string $priority
 * @property float $position
 * @property string|null $due_date
 * @property int|null $estimate_minutes
 * @property string|null $deleted_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereCreatorId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDeletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereDueDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereEstimateMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereParentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePosition($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task wherePriority($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereProjectId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereStatusId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\TaskActivity> $activities
 * @property-read int|null $activities_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $assignees
 * @property-read int|null $assignees_count
 * @property-read \App\Models\User $creator
 * @property-read Task|null $parent
 * @property-read \App\Models\Project $project
 * @property-read \App\Models\TaskStatus $status
 * @property-read \Illuminate\Database\Eloquent\Collection<int, Task> $subtasks
 * @property-read int|null $subtasks_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task onlyTrashed()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withTrashed(bool $withTrashed = true)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Task withoutTrashed()
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Tag> $tags
 * @property-read int|null $tags_count
 * @mixin \Eloquent
 */
class Task extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'status_id',
        'parent_id',
        'creator_id',
        'title',
        'description',
        'priority',
        'position',
        'due_date',
        'estimate_minutes'
    ];

    protected $casts = [
        'position' => 'double',
        'due_date' => 'datetime',
        'estimate_minutes' => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(Status::class, 'status_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function assignees(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'task_assignments')->withTimestamps();
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Task::class, 'parent_id');
    }

    // public function children(): HasMany
    // {
    //     return $this->hasMany(Task::class, 'parent_id');
    // }

    public function subtasks(): HasMany
    {
        // return $this->hasMany(Task::class, 'parent_id')->orderBy('position', 'asc');
        return $this->hasMany(Task::class, 'parent_id');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(TaskActivity::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'task_tags');
    }

    // task comments
    public function comments(): HasMany
    {
        // Only get top-level comments; replies will be nested inside them
        return $this->hasMany(TaskComment::class)->whereNull('parent_id')->with('replies.user');
    }

    public function replies(): HasMany
    {
        return $this->hasMany(TaskComment::class, 'parent_id')->with('user');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
