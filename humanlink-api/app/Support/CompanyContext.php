<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class CompanyContext
{
    public function user(): ?User
    {
        $user = Auth::user();

        return $user instanceof User ? $user : null;
    }

    public function id(): ?int
    {
        $companyId = $this->user()?->company_id;

        return $companyId !== null ? (int) $companyId : null;
    }

    public function requireId(): int
    {
        $companyId = $this->id();

        if ($companyId === null) {
            throw new RuntimeException('Authenticated user has no company context.');
        }

        return $companyId;
    }

    public function isPlatformAdmin(): bool
    {
        return (bool) $this->user()?->hasRole('super-admin');
    }

    public function shouldScope(): bool
    {
        // Scope whenever the actor has an active company (including super-admin after switch).
        return $this->id() !== null;
    }

    public function constrain(Builder $query, string $column = 'company_id'): Builder
    {
        if (! $this->shouldScope()) {
            return $query;
        }

        return $query->where($column, $this->id());
    }

    public function constrainByUserCompany(Builder $query, string $userIdColumn = 'user_id'): Builder
    {
        if (! $this->shouldScope()) {
            return $query;
        }

        return $query->whereIn($userIdColumn, function ($sub): void {
            $sub->select('id')
                ->from('users')
                ->where('company_id', $this->id());
        });
    }
}
