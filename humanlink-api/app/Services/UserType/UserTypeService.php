<?php

declare(strict_types=1);

namespace App\Services\UserType;

use App\Contracts\UserTypeServiceInterface;
use App\Enums\AccessScope;
use App\Models\Company;
use App\Models\Permission;
use App\Models\UserType;
use App\Services\UserType\Concerns\ManagesUserTypePermissions;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserTypeService implements UserTypeServiceInterface
{
    use ManagesUserTypePermissions;

    public function __construct(
        private CompanyContext $companyContext
    ) {}

    public function list(): Collection
    {
        $query = UserType::query()
            ->with('permissions:id,name,guard_name')
            ->withCount('users')
            ->latest();

        $this->companyContext->constrain($query);

        return $query->get();
    }

    public function create(array $data): UserType
    {
        return DB::transaction(function () use ($data): UserType {
            $companyId = (int) ($data['company_id'] ?? $this->companyContext->requireId());
            $name = trim((string) $data['name']);
            $slug = $this->uniqueSlug($companyId, $data['slug'] ?? $name);

            $userType = UserType::query()->create([
                'company_id' => $companyId,
                'name' => $name,
                'slug' => $slug,
                'access_scope' => AccessScope::from((string) $data['access_scope']),
                'is_system' => false,
            ]);

            if (array_key_exists('permissions', $data)) {
                $this->syncPermissions($userType, $data['permissions'] ?? []);
            }

            return $userType->load('permissions:id,name,guard_name')->loadCount('users');
        });
    }

    public function update(UserType $userType, array $data): UserType
    {
        $this->assertSameCompany($userType);

        return DB::transaction(function () use ($userType, $data): UserType {
            $payload = [];

            if (array_key_exists('name', $data)) {
                $payload['name'] = trim((string) $data['name']);
            }

            if (array_key_exists('access_scope', $data)) {
                $payload['access_scope'] = AccessScope::from((string) $data['access_scope']);
            }

            if (array_key_exists('slug', $data) && filled($data['slug']) && ! $userType->is_system) {
                $payload['slug'] = $this->uniqueSlug(
                    (int) $userType->company_id,
                    (string) $data['slug'],
                    $userType->id
                );
            }

            if ($payload !== []) {
                $userType->update($payload);
            }

            $permissionsChanged = array_key_exists('permissions', $data);
            if ($permissionsChanged) {
                $this->syncPermissions($userType, $data['permissions'] ?? []);
            }

            $userType->load('permissions:id,name,guard_name')->loadCount('users');

            if ($permissionsChanged || array_key_exists('access_scope', $data)) {
                $this->resyncAssignedUsers($userType);
            }

            return $userType;
        });
    }

    public function delete(UserType $userType): void
    {
        $this->assertSameCompany($userType);

        if ($userType->is_system) {
            throw ValidationException::withMessages([
                'user_type' => ['System user types cannot be deleted.'],
            ]);
        }

        if ($userType->users()->exists()) {
            throw ValidationException::withMessages([
                'user_type' => ['Reassign users before deleting this user type.'],
            ]);
        }

        $userType->delete();
    }

    public function provisionDefaults(Company $company): void
    {
        $permissionIdsByName = Permission::query()
            ->pluck('id', 'name');

        foreach (DefaultUserTypeDefinitions::all() as $definition) {
            $userType = UserType::query()->updateOrCreate(
                [
                    'company_id' => $company->id,
                    'slug' => $definition['slug'],
                ],
                [
                    'name' => $definition['name'],
                    'access_scope' => $definition['access_scope'],
                    'is_system' => true,
                ]
            );

            $permissionIds = collect($definition['permissions'])
                ->map(fn (string $name) => $permissionIdsByName[$name] ?? null)
                ->filter()
                ->values()
                ->all();

            $userType->permissions()->sync($permissionIds);
        }
    }

    private function uniqueSlug(int $companyId, string $value, ?int $ignoreId = null): string
    {
        $base = Str::slug($value) ?: 'user-type';
        $slug = $base;
        $suffix = 2;

        while (
            UserType::query()
                ->where('company_id', $companyId)
                ->where('slug', $slug)
                ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
                ->exists()
        ) {
            $slug = "{$base}-{$suffix}";
            $suffix++;
        }

        return $slug;
    }

    private function assertSameCompany(UserType $userType): void
    {
        if (! $this->companyContext->shouldScope()) {
            return;
        }

        if ((int) $userType->company_id !== $this->companyContext->requireId()) {
            abort(403, 'User type does not belong to your company.');
        }
    }
}
