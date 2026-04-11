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
        'weekly_data' => 'array',
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getWeeklyDataAttribute($value)
    {
        $data = json_decode($value, true);
        return collect($data)->map(fn($day) => [
            'dayOfWeek'    => $day['day_of_week'] ?? null,
            'shiftStart'   => $day['shift_start'] ?? '08:00',
            'shiftEnd'     => $day['shift_end'] ?? '17:00',
            'isRestDay'    => (bool)($day['is_rest_day'] ?? false),
            'isNightShift' => (bool)($day['is_night_shift'] ?? false),
        ]);
    }
}
