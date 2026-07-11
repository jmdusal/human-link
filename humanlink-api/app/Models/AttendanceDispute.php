<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $attendance_id
 * @property int $user_id
 * @property string $reason
 * @property int|null $proposed_total_ms
 * @property int|null $proposed_overtime_ms
 * @property string $status
 * @property string|null $resolution_note
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Attendance $attendance
 * @property-read \App\Models\User|null $reviewer
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereAttendanceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereProposedOvertimeMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereProposedTotalMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereResolutionNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereUserId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $attendance_id
 * @property int $user_id
 * @property string $reason
 * @property int|null $proposed_total_ms
 * @property int|null $proposed_overtime_ms
 * @property string $status
 * @property string|null $resolution_note
 * @property int|null $reviewed_by
 * @property \Illuminate\Support\Carbon|null $reviewed_at
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Attendance $attendance
 * @property-read \App\Models\User|null $reviewer
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereAttendanceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereProposedOvertimeMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereProposedTotalMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReason($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereResolutionNote($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReviewedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereReviewedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceDispute whereUserId($value)
 * @mixin \Eloquent
 */
class AttendanceDispute extends Model
{
    protected $fillable = [
        'attendance_id',
        'user_id',
        'reason',
        'proposed_total_ms',
        'proposed_overtime_ms',
        'status',
        'resolution_note',
        'reviewed_by',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'proposed_total_ms' => 'integer',
            'proposed_overtime_ms' => 'integer',
            'reviewed_at' => 'datetime',
        ];
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
