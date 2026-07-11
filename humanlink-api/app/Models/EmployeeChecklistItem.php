<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $employee_checklist_id
 * @property string $key
 * @property string $label
 * @property bool $is_done
 * @property \Illuminate\Support\Carbon|null $done_at
 * @property int|null $done_by
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\EmployeeChecklist $checklist
 * @property-read \App\Models\User|null $doneBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereDoneAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereDoneBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereEmployeeChecklistId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereIsDone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $employee_checklist_id
 * @property string $key
 * @property string $label
 * @property bool $is_done
 * @property \Illuminate\Support\Carbon|null $done_at
 * @property int|null $done_by
 * @property int $sort_order
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\EmployeeChecklist $checklist
 * @property-read \App\Models\User|null $doneBy
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereDoneAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereDoneBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereEmployeeChecklistId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereIsDone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereKey($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereSortOrder($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|EmployeeChecklistItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class EmployeeChecklistItem extends Model
{
    protected $fillable = [
        'employee_checklist_id',
        'key',
        'label',
        'is_done',
        'done_at',
        'done_by',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_done' => 'boolean',
            'done_at' => 'datetime',
            'sort_order' => 'integer',
        ];
    }

    public function checklist(): BelongsTo
    {
        return $this->belongsTo(EmployeeChecklist::class, 'employee_checklist_id');
    }

    public function doneBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'done_by');
    }
}
