<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property int|null $completed_by
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $completedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmployeeChecklistItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCompletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereUserId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $status
 * @property \Illuminate\Support\Carbon|null $completed_at
 * @property int|null $completed_by
 * @property string|null $notes
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User|null $completedBy
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\EmployeeChecklistItem> $items
 * @property-read int|null $items_count
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCompletedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCompletedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereNotes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklist whereUserId($value)
 * @mixin \Eloquent
 */
class EmployeeChecklist extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'status',
        'completed_at',
        'completed_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(EmployeeChecklistItem::class)->orderBy('sort_order');
    }
}
