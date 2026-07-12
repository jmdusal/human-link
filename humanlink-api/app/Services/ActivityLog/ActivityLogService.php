<?php

declare(strict_types=1);

namespace App\Services\ActivityLog;

use App\Contracts\ActivityLogServiceInterface;
use App\Models\Activity;
use App\Support\CompanyContext;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ActivityLogService implements ActivityLogServiceInterface
{
    public function __construct(
        private CompanyContext $companyContext,
    ) {}

    public function list(): Collection
    {
        $query = Activity::query()
            ->with(['causer', 'subject', 'company'])
            ->latest();

        $this->companyContext->constrain($query);

        return $query
            ->get()
            ->map(fn (Activity $activity): array => $this->transform($activity))
            ->values();
    }

    /**
     * @return array<string, mixed>
     */
    protected function transform(Activity $activity): array
    {
        $event = $this->resolveEvent($activity);
        $resource = $this->friendlyResource((string) $activity->subject_type);
        $subjectLabel = $this->subjectLabel($activity);
        $changes = $this->formatChanges($activity);
        $causerName = $activity->causer?->name ?? 'System';

        return [
            'id' => $activity->id,
            'event' => $event,
            'description' => $activity->description,
            'summary' => $this->buildSummary($causerName, $event, $resource, $subjectLabel),
            'subjectType' => class_basename((string) $activity->subject_type) ?: 'System',
            'resource' => $resource,
            'subjectLabel' => $subjectLabel,
            'changes' => $changes,
            'properties' => $activity->properties,
            'companyId' => $activity->company_id,
            'company' => $activity->company ? [
                'id' => $activity->company->id,
                'name' => $activity->company->name,
                'slug' => $activity->company->slug,
            ] : null,
            'causer' => $activity->causer ? [
                'name' => $activity->causer->name,
                'email' => $activity->causer->email,
            ] : null,
            'time' => $activity->created_at?->diffForHumans(),
            'createdAt' => $activity->created_at,
        ];
    }

    protected function resolveEvent(Activity $activity): string
    {
        $event = strtolower((string) ($activity->event ?: $activity->description));

        return match (true) {
            str_contains($event, 'creat') => 'created',
            str_contains($event, 'updat') => 'updated',
            str_contains($event, 'delet') => 'deleted',
            default => $event !== '' ? $event : 'updated',
        };
    }

    protected function friendlyResource(string $subjectType): string
    {
        if ($subjectType === '') {
            return 'Record';
        }

        return Str::headline(class_basename($subjectType));
    }

    protected function subjectLabel(Activity $activity): ?string
    {
        $subject = $activity->subject;

        if ($subject instanceof Model) {
            foreach (['name', 'title', 'email', 'slug'] as $attribute) {
                $value = $subject->getAttribute($attribute);
                if (is_string($value) && $value !== '') {
                    return $value;
                }
            }
        }

        $attributes = $activity->properties['attributes'] ?? [];
        foreach (['name', 'title', 'email', 'slug'] as $attribute) {
            $value = $attributes[$attribute] ?? null;
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        $old = $activity->properties['old'] ?? [];
        foreach (['name', 'title', 'email', 'slug'] as $attribute) {
            $value = $old[$attribute] ?? null;
            if (is_string($value) && $value !== '') {
                return $value;
            }
        }

        return null;
    }

    /**
     * @return list<array{field: string, old: mixed, new: mixed}>
     */
    protected function formatChanges(Activity $activity): array
    {
        $attributes = $activity->properties['attributes'] ?? [];
        $old = $activity->properties['old'] ?? [];

        if (! is_array($attributes)) {
            $attributes = [];
        }

        if (! is_array($old)) {
            $old = [];
        }

        $keys = array_values(array_unique([...array_keys($old), ...array_keys($attributes)]));
        $changes = [];

        foreach ($keys as $key) {
            if (! is_string($key) || in_array($key, ['password', 'remember_token', 'two_factor_secret', 'two_factor_recovery_codes'], true)) {
                continue;
            }

            $oldValue = $old[$key] ?? null;
            $newValue = $attributes[$key] ?? null;

            if ($oldValue === $newValue) {
                continue;
            }

            $changes[] = [
                'field' => Str::headline(str_replace('_', ' ', $key)),
                'old' => $this->stringifyValue($oldValue),
                'new' => $this->stringifyValue($newValue),
            ];
        }

        return $changes;
    }

    protected function stringifyValue(mixed $value): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? 'Yes' : 'No';
        }

        if (is_array($value) || is_object($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: null;
        }

        return (string) $value;
    }

    protected function buildSummary(string $causerName, string $event, string $resource, ?string $subjectLabel): string
    {
        $action = match ($event) {
            'created' => 'created',
            'deleted' => 'deleted',
            default => 'updated',
        };

        $target = $subjectLabel ? "{$resource} · {$subjectLabel}" : $resource;

        return "{$causerName} {$action} {$target}";
    }
}
