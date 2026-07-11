<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $agency
 * @property \Illuminate\Support\Carbon $effective_date
 * @property numeric $min_compensation
 * @property numeric|null $max_compensation
 * @property numeric|null $employee_rate
 * @property numeric|null $employer_rate
 * @property numeric|null $employee_amount
 * @property numeric|null $employer_amount
 * @property numeric|null $base_amount
 * @property array<array-key, mixed>|null $meta
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereAgency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereBaseAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEffectiveDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployeeAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployeeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployerAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployerRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMaxCompensation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMeta($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMinCompensation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property string $agency
 * @property \Illuminate\Support\Carbon $effective_date
 * @property numeric $min_compensation
 * @property numeric|null $max_compensation
 * @property numeric|null $employee_rate
 * @property numeric|null $employer_rate
 * @property numeric|null $employee_amount
 * @property numeric|null $employer_amount
 * @property numeric|null $base_amount
 * @property array<array-key, mixed>|null $meta
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereAgency($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereBaseAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEffectiveDate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployeeAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployeeRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployerAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereEmployerRate($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMaxCompensation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMeta($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereMinCompensation($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|StatutoryContributionBracket whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class StatutoryContributionBracket extends Model
{
    protected $fillable = [
        'agency',
        'effective_date',
        'min_compensation',
        'max_compensation',
        'employee_rate',
        'employer_rate',
        'employee_amount',
        'employer_amount',
        'base_amount',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date:Y-m-d',
            'min_compensation' => 'decimal:2',
            'max_compensation' => 'decimal:2',
            'employee_rate' => 'decimal:6',
            'employer_rate' => 'decimal:6',
            'employee_amount' => 'decimal:2',
            'employer_amount' => 'decimal:2',
            'base_amount' => 'decimal:2',
            'meta' => 'array',
        ];
    }
}
