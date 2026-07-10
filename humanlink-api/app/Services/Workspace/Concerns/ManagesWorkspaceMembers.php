<?php

declare(strict_types=1);

namespace App\Services\Workspace\Concerns;

use App\Mail\WorkspaceInvitation;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

trait ManagesWorkspaceMembers
{
    protected function attachOwner(Workspace $workspace): void
    {
        $workspace->members()->attach(Auth::id(), ['role' => 'owner']);
    }

    protected function syncMembersOnCreate(Workspace $workspace, array $members): void
    {
        $memberIds = collect($members)
            ->pluck('id')
            ->reject(fn ($id) => $id == Auth::id())
            ->values();

        if ($memberIds->isEmpty()) {
            return;
        }

        $membersWithRoles = $memberIds->mapWithKeys(
            fn ($id) => [$id => ['role' => 'member']]
        )->all();

        $workspace->members()->syncWithoutDetaching($membersWithRoles);
    }

    protected function syncMembersOnUpdate(Workspace $workspace, array $members): void
    {
        $existingMemberIds = $workspace->members()->pluck('users.id')->all();

        $syncData = collect($members)->mapWithKeys(function (array $member) use ($workspace): array {
            $id = $member['id'];

            if ($id == $workspace->owner_id) {
                return [$id => ['role' => 'owner']];
            }

            return [$id => ['role' => $member['pivot']['role'] ?? 'member']];
        })->all();

        if (! isset($syncData[$workspace->owner_id])) {
            $syncData[$workspace->owner_id] = ['role' => 'owner'];
        }

        $workspace->members()->sync($syncData);

        $newMemberIds = array_diff(array_keys($syncData), $existingMemberIds);

        if ($newMemberIds === []) {
            return;
        }

        User::query()
            ->whereIn('id', $newMemberIds)
            ->get()
            ->each(fn (User $user) => Mail::to($user->email)->queue(new WorkspaceInvitation($workspace, $user)));
    }
}
