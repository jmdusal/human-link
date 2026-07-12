<?php

declare(strict_types=1);

namespace App\Services\UserType;

use App\Enums\AccessScope;
use App\Support\UserTypePermissions;

/**
 * Single source of truth for seeded company user types.
 */
final class DefaultUserTypeDefinitions
{
    /**
     * @return list<array{name: string, slug: string, access_scope: AccessScope, permissions: list<string>}>
     */
    public static function all(): array
    {
        return [
            [
                'name' => 'Employee',
                'slug' => 'employee',
                'access_scope' => AccessScope::Self,
                'permissions' => UserTypePermissions::employee(),
            ],
            [
                'name' => 'HR',
                'slug' => 'hr',
                'access_scope' => AccessScope::Company,
                'permissions' => UserTypePermissions::hr(),
            ],
            [
                'name' => 'Manager',
                'slug' => 'manager',
                'access_scope' => AccessScope::Workspace,
                'permissions' => UserTypePermissions::manager(),
            ],
        ];
    }
}
