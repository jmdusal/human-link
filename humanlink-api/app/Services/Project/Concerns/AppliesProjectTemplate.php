<?php

declare(strict_types=1);

namespace App\Services\Project\Concerns;

use App\Models\Task;
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
        $hasTasks = Task::query()
            ->whereHas('project', fn ($query) => $query->where('workspace_id', $workspace->id))
            ->exists();

        if (! $hasTasks) {
            $this->replaceWorkspaceBoardFromTemplate($workspace, $template);

            return;
        }

        $this->mergeWorkspaceBoardFromTemplate($workspace, $template);
    }

    /**
     * @param  array{statuses?: list<array{name: string, color_hex: string}>, tags?: list<array{name: string, color: string}>}  $template
     */
    protected function replaceWorkspaceBoardFromTemplate(Workspace $workspace, array $template): void
    {
        $workspace->statuses()->delete();
        $workspace->tags()->delete();

        $statusesToCreate = [];
        foreach (array_values($template['statuses'] ?? []) as $index => $status) {
            $statusesToCreate[] = [
                'name' => (string) $status['name'],
                'color_hex' => $status['color_hex'],
                'position' => $index,
            ];
        }

        if ($statusesToCreate !== []) {
            $workspace->statuses()->createMany($statusesToCreate);
        }

        $tagsToCreate = [];
        foreach ($template['tags'] ?? [] as $tag) {
            $tagsToCreate[] = [
                'name' => (string) $tag['name'],
                'color' => $tag['color'],
            ];
        }

        if ($tagsToCreate !== []) {
            $workspace->tags()->createMany($tagsToCreate);
        }
    }

    /**
     * @param  array{statuses?: list<array{name: string, color_hex: string}>, tags?: list<array{name: string, color: string}>}  $template
     */
    protected function mergeWorkspaceBoardFromTemplate(Workspace $workspace, array $template): void
    {
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
