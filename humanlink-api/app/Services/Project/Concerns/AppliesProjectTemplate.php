<?php

declare(strict_types=1);

namespace App\Services\Project\Concerns;

use App\Models\Workspace;
use InvalidArgumentException;

trait AppliesProjectTemplate
{
    protected function applyProjectTemplate(Workspace $workspace, string $templateKey): void
    {
        $templates = config('project_templates', []);

        if (! isset($templates[$templateKey])) {
            throw new InvalidArgumentException("Unknown project template [{$templateKey}].");
        }

        $template = $templates[$templateKey];
        $existingStatusNames = $workspace->statuses()->pluck('name')->map(fn ($name) => strtolower((string) $name));
        $existingTagNames = $workspace->tags()->pluck('name')->map(fn ($name) => strtolower((string) $name));

        $nextPosition = (int) $workspace->statuses()->max('position') + 1;
        $statusesToCreate = [];

        foreach ($template['statuses'] ?? [] as $status) {
            $name = (string) $status['name'];
            if ($existingStatusNames->contains(strtolower($name))) {
                continue;
            }

            $statusesToCreate[] = [
                'name' => $name,
                'color_hex' => $status['color_hex'],
                'position' => $nextPosition++,
            ];
        }

        if ($statusesToCreate !== []) {
            $workspace->statuses()->createMany($statusesToCreate);
        }

        $tagsToCreate = [];

        foreach ($template['tags'] ?? [] as $tag) {
            $name = (string) $tag['name'];
            if ($existingTagNames->contains(strtolower($name))) {
                continue;
            }

            $tagsToCreate[] = [
                'name' => $name,
                'color' => $tag['color'],
            ];
        }

        if ($tagsToCreate !== []) {
            $workspace->tags()->createMany($tagsToCreate);
        }
    }
}
