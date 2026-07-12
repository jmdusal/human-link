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
 * @property int|null $department_id
 * @property int|null $position_id
 * @property-read \App\Models\Department|null $departmentRelation
 * @property-read \App\Models\Position|null $position
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereDepartmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePositionId($value)
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
 * @property int|null $department_id
 * @property int|null $position_id
 * @property-read \App\Models\Department|null $departmentRelation
 * @property-read \App\Models\Position|null $position
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail whereDepartmentId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDetail wherePositionId($value)
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
        'department_id',
        'position_id',
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

    public function departmentRelation(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}
