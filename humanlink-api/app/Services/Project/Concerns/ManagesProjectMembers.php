<?php

declare(strict_types=1);

namespace App\Services\Project\Concerns;

use App\Models\Project;

trait ManagesProjectMembers
{
    protected function syncProjectMembers(Project $project, array $members): void
    {
        $membersWithRoles = collect($members)
            ->mapWithKeys(fn (array $member): array => [
                $member['id'] => [
                    'role' => $member['pivot']['role'] ?? 'member',
                ],
            ])
            ->all();

        $project->projectMembers()->sync($membersWithRoles);
    }
}
