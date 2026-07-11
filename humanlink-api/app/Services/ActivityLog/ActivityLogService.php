<?php

declare(strict_types=1);

namespace App\Services\ActivityLog;

use App\Contracts\ActivityLogServiceInterface;
use App\Models\Activity;
use App\Support\CompanyContext;
use Illuminate\Support\Collection;

class ActivityLogService implements ActivityLogServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext,
    ) {}

    public function list(): Collection
    {
        $query = Activity::query()
            ->with('causer')
            ->latest();

        $this->companyContext->constrain($query);

        return $query
            ->get()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'description' => $activity->description,
                'subjectType' => class_basename($activity->subject_type),
                'properties' => $activity->properties,
                'companyId' => $activity->company_id,
                'causer' => $activity->causer ? [
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'createdAt' => $activity->created_at,
            ]);
    }
}
