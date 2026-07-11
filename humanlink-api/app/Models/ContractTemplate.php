<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 * @property string $employment_type
 * @property string $body
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereEmploymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property string $name
 * @property string $employment_type
 * @property string $body
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereEmploymentType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|ContractTemplate whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class ContractTemplate extends Model
{
    public const PLACEHOLDERS = [
        'employee_name',
        'email',
        'job_title',
        'department',
        'employment_type',
        'hired_at',
        'monthly_rate',
        'daily_rate',
        'hourly_rate',
        'generated_at',
    ];

    protected $fillable = [
        'name',
        'employment_type',
        'body',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
