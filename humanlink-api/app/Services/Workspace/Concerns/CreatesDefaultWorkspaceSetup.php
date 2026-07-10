<?php

declare(strict_types=1);

namespace App\Services\Workspace\Concerns;

use App\Models\Workspace;

trait CreatesDefaultWorkspaceSetup
{
    protected function createDefaultStatuses(Workspace $workspace): void
    {
        $workspace->statuses()->createMany([
            ['name' => 'Todo', 'color_hex' => '#3b82f6', 'position' => 0],
            ['name' => 'In Progress', 'color_hex' => '#f59e0b', 'position' => 1],
            ['name' => 'Done', 'color_hex' => '#10b981', 'position' => 2],
        ]);
    }

    protected function createDefaultTags(Workspace $workspace): void
    {
        $workspace->tags()->createMany([
            ['name' => 'Bug', 'color' => '#ef4444'],
            ['name' => 'Enhancement', 'color' => '#3b82f6'],
            ['name' => 'Feature', 'color' => '#10b981'],
            ['name' => 'Refactor', 'color' => '#8b5cf6'],
        ]);
    }
}
