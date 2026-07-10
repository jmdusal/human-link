<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $date
 * @property string $shift_start
 * @property string $shift_end
 * @property int $break_minutes
 * @property int $is_rest_day
 * @property int $is_night_shift
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereBreakMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsNightShift($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsRestDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUserId($value)
 * @property-read \App\Models\User|null $user
 * @property int|null $day_of_week
 * @property bool $is_active
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDayOfWeek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsActive($value)
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereStartDate($value)
 * @property string|null $weekly_data
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereWeeklyData($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $user_id
 * @property string $date
 * @property string $shift_start
 * @property string $shift_end
 * @property int $break_minutes
 * @property int $is_rest_day
 * @property int $is_night_shift
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereBreakMinutes($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsNightShift($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsRestDay($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftEnd($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereShiftStart($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereUserId($value)
 * @property-read \App\Models\User|null $user
 * @property int|null $day_of_week
 * @property bool $is_active
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereDayOfWeek($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereIsActive($value)
 * @property \Illuminate\Support\Carbon $start_date
 * @property \Illuminate\Support\Carbon|null $end_date
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereEndDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereStartDate($value)
 * @property string|null $weekly_data
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Schedule whereWeeklyData($value)
 * @mixin \Eloquent
 */
class Schedule extends Model
{
    protected $fillable = [
        'user_id',
        'weekly_data',
        'start_date',
        'end_date',
        'break_minutes',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getWeeklyDataAttribute($value)
    {
        $data = is_string($value) ? json_decode($value, true) : $value;

        if (! is_array($data)) {
            return collect();
        }

        return collect($data)->map(function ($day) {
            $day = (array) $day;

            $shiftStart = (string) ($day['shift_start'] ?? $day['shiftStart'] ?? '08:00');
            $shiftEnd = (string) ($day['shift_end'] ?? $day['shiftEnd'] ?? '17:00');

            return [
                'dayOfWeek' => (int) ($day['day_of_week'] ?? $day['dayOfWeek'] ?? 0),
                'shiftStart' => substr($shiftStart, 0, 5),
                'shiftEnd' => substr($shiftEnd, 0, 5),
                'isRestDay' => (bool) ($day['is_rest_day'] ?? $day['isRestDay'] ?? false),
                'isNightShift' => (bool) ($day['is_night_shift'] ?? $day['isNightShift'] ?? false),
            ];
        });
    }

    public function setWeeklyDataAttribute($value): void
    {
        $normalized = collect(is_array($value) ? $value : [])->map(function ($day) {
            $day = (array) $day;

            $shiftStart = (string) ($day['shift_start'] ?? $day['shiftStart'] ?? '08:00');
            $shiftEnd = (string) ($day['shift_end'] ?? $day['shiftEnd'] ?? '17:00');

            return [
                'day_of_week' => (int) ($day['day_of_week'] ?? $day['dayOfWeek'] ?? 0),
                'shift_start' => substr($shiftStart, 0, 5),
                'shift_end' => substr($shiftEnd, 0, 5),
                'is_rest_day' => (bool) ($day['is_rest_day'] ?? $day['isRestDay'] ?? $day['is_rest'] ?? false),
                'is_night_shift' => (bool) ($day['is_night_shift'] ?? $day['isNightShift'] ?? $day['is_night'] ?? false),
            ];
        })->values()->all();

        $this->attributes['weekly_data'] = json_encode($normalized);
    }
}
