<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property numeric $default_credits
 * @property int $is_active
 * @property int $is_paid
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereDefaultCredits($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsPaid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property numeric $default_credits
 * @property int $is_active
 * @property int $is_paid
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereDefaultCredits($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereIsPaid($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|LeavePolicy whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class LeavePolicy extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'default_credits',
        'is_active',
        'is_paid',
    ];
    protected $casts = [
        'default_credits' => 'decimal:2',
    ];
}
