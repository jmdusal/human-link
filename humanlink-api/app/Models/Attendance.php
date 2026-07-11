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
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\AttendanceBreak> $breaks
 * @property-read int|null $breaks_count
 * @property-read \App\Models\User $user
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
}
