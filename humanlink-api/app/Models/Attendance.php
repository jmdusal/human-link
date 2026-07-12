<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property \Illuminate\Support\Carbon $date
 * @property \Illuminate\Support\Carbon|null $started_at
 * @property \Illuminate\Support\Carbon|null $ended_at
 * @property int $total_ms
 * @property int $late_ms
 * @property int $undertime_ms
 * @property int $overtime_ms
 * @property int $break_ms
 * @property int $required_ms
 * @property string|null $scheduled_start
 * @property string|null $scheduled_end
 * @property string $status
 * @property string|null $start_latitude
 * @property string|null $start_longitude
 * @property string|null $start_accuracy
 * @property string|null $end_latitude
 * @property string|null $end_longitude
 * @property string|null $end_accuracy
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceBreak> $breaks
 * @property-read int|null $breaks_count
 * @property-read \App\Models\User $user
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceDispute> $disputes
 * @property-read int|null $disputes_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereBreakMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereEndedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereLateMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereOvertimeMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereRequiredMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereScheduledEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereScheduledStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStartedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereTotalMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUndertimeMs($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereUserId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereEndAccuracy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereEndLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereEndLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStartAccuracy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStartLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Attendance whereStartLongitude($value)
 * @mixin \Eloquent
 */
class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'date',
        'started_at',
        'ended_at',
        'total_ms',
        'late_ms',
        'undertime_ms',
        'overtime_ms',
        'break_ms',
        'required_ms',
        'scheduled_start',
        'scheduled_end',
        'status',
        'start_latitude',
        'start_longitude',
        'start_accuracy',
        'end_latitude',
        'end_longitude',
        'end_accuracy',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date:Y-m-d',
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'total_ms' => 'integer',
            'late_ms' => 'integer',
            'undertime_ms' => 'integer',
            'overtime_ms' => 'integer',
            'break_ms' => 'integer',
            'required_ms' => 'integer',
            'start_latitude' => 'float',
            'start_longitude' => 'float',
            'start_accuracy' => 'float',
            'end_latitude' => 'float',
            'end_longitude' => 'float',
            'end_accuracy' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function breaks(): HasMany
    {
        return $this->hasMany(AttendanceBreak::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(AttendanceDispute::class);
    }
}
