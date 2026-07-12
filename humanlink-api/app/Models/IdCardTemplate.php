<?php

declare(strict_types=1);

namespace App\Models;

use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $body
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $body
 * @property bool $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereBody($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|IdCardTemplate whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class IdCardTemplate extends Model
{
    use BelongsToCompany;

    public const PLACEHOLDERS = [
        'company_name',
        'employee_name',
        'email',
        'job_title',
        'department',
        'employment_type',
        'hired_at',
        'generated_at',
        'initials',
    ];

    protected $fillable = [
        'company_id',
        'name',
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
