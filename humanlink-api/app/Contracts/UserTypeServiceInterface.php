<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\Company;
use App\Models\UserType;
use Illuminate\Database\Eloquent\Collection;

interface UserTypeServiceInterface
{
    public function list(): Collection;

    public function create(array $data): UserType;

    public function update(UserType $userType, array $data): UserType;

    public function delete(UserType $userType): void;

    public function provisionDefaults(Company $company): void;
}
