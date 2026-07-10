<?php

declare(strict_types=1);

namespace App\Services\ActivityLog;

use App\Contracts\ActivityLogServiceInterface;
use Illuminate\Support\Collection;
use Spatie\Activitylog\Models\Activity;

class ActivityLogService implements ActivityLogServiceInterface
{
    public function list(): Collection
    {
        return Activity::query()
            ->with('causer')
            ->latest()
            ->get()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'description' => $activity->description,
                'subjectType' => class_basename($activity->subject_type),
                'properties' => $activity->properties,
                'causer' => $activity->causer ? [
                    'name' => $activity->causer->name,
                    'email' => $activity->causer->email,
                ] : null,
                'createdAt' => $activity->created_at,
            ]);
    }
}
