<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use Illuminate\Http\Request;

interface AuthServiceInterface
{
    public function login(Request $request, array $credentials): User;

    public function logout(Request $request): void;
}
