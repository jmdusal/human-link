<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $attendance_id
 * @property \Illuminate\Support\Carbon $paused_at
 * @property \Illuminate\Support\Carbon|null $resumed_at
 * @property int $duration_ms
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Attendance $attendance
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereAttendanceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereDurationMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak wherePausedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereResumedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $attendance_id
 * @property \Illuminate\Support\Carbon $paused_at
 * @property \Illuminate\Support\Carbon|null $resumed_at
 * @property int $duration_ms
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Attendance $attendance
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereAttendanceId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereDurationMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak wherePausedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereResumedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|AttendanceBreak whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class AttendanceBreak extends Model
{
    protected $fillable = [
        'attendance_id',
        'paused_at',
        'resumed_at',
        'duration_ms',
    ];

    protected function casts(): array
    {
        return [
            'paused_at' => 'datetime',
            'resumed_at' => 'datetime',
            'duration_ms' => 'integer',
        ];
    }

    public function attendance(): BelongsTo
    {
        return $this->belongsTo(Attendance::class);
    }
}
