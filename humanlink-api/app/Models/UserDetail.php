<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $sss_number
 * @property string|null $philhealth_number
 * @property string|null $pagibig_number
 * @property string|null $tin
 * @property string|null $job_title
 * @property string|null $department
 * @property string|null $employment_type
 * @property string|null $mobile
 * @property string|null $emergency_contact_name
 * @property string|null $emergency_contact_phone
 * @property string|null $emergency_contact_relationship
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereDepartment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactRelationship($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmploymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereJobTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereMobile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePagibigNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePhilhealthNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereSssNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereTin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereUserId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $user_id
 * @property string|null $sss_number
 * @property string|null $philhealth_number
 * @property string|null $pagibig_number
 * @property string|null $tin
 * @property string|null $job_title
 * @property string|null $department
 * @property string|null $employment_type
 * @property string|null $mobile
 * @property string|null $emergency_contact_name
 * @property string|null $emergency_contact_phone
 * @property string|null $emergency_contact_relationship
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereDepartment($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactPhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmergencyContactRelationship($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereEmploymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereJobTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereMobile($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePagibigNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePhilhealthNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereSssNumber($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereTin($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereUserId($value)
 * @mixin \Eloquent
 */
class UserDetail extends Model
{
    public const EMPLOYMENT_TYPES = [
        'regular',
        'probationary',
        'contractor',
    ];

    protected $fillable = [
        'user_id',
        'sss_number',
        'philhealth_number',
        'pagibig_number',
        'tin',
        'job_title',
        'department',
        'employment_type',
        'mobile',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
