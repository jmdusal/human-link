<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AccessScope;
use App\Models\Concerns\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $slug
 * @property AccessScope $access_scope
 * @property bool $is_system
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereAccessScope($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereIsSystem($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereUpdatedAt($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $company_id
 * @property string $name
 * @property string $slug
 * @property AccessScope $access_scope
 * @property bool $is_system
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \App\Models\Company $company
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Permission> $permissions
 * @property-read int|null $permissions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType forCompany(int $companyId)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereAccessScope($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereCompanyId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereIsSystem($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserType whereUpdatedAt($value)
 * @mixin \Eloquent
 */
class UserType extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id',
        'name',
        'slug',
        'access_scope',
        'is_system',
    ];

    protected function casts(): array
    {
        return [
            'access_scope' => AccessScope::class,
            'is_system' => 'boolean',
        ];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'user_type_permission',
            'user_type_id',
            'permission_id'
        );
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'user_type_id');
    }

    public function isCompanyScope(): bool
    {
        return $this->access_scope === AccessScope::Company;
    }

    public function isWorkspaceScope(): bool
    {
        return $this->access_scope === AccessScope::Workspace;
    }

    public function isSelfScope(): bool
    {
        return $this->access_scope === AccessScope::Self;
    }
}
