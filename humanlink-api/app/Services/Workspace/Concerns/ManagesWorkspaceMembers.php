<?php

declare(strict_types=1);

namespace App\Services\Workspace\Concerns;

use App\Mail\WorkspaceInvitation;
use App\Mail\WorkspaceInvitationAccepted;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

trait ManagesWorkspaceMembers
{
    protected function attachOwner(Workspace $workspace): void
    {
        $workspace->members()->attach(Auth::id(), [
            'role' => 'owner',
            'status' => WorkspaceUser::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);
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

        $invitees = User::query()->whereIn('id', $memberIds)->get();

        foreach ($invitees as $user) {
            $token = Str::random(64);

            $workspace->members()->attach($user->id, [
                'role' => 'member',
                'status' => WorkspaceUser::STATUS_PENDING,
                'invitation_token' => $token,
                'invited_at' => now(),
            ]);

            $this->queueInvitationEmail($workspace, $user, $token);
        }
    }

    protected function syncMembersOnUpdate(Workspace $workspace, array $members): void
    {
        $existingPivots = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->get()
            ->keyBy('user_id');

        $syncData = [];

        foreach ($members as $member) {
            $id = (int) $member['id'];
            $existing = $existingPivots->get($id);

            if ($id === (int) $workspace->owner_id) {
                $syncData[$id] = [
                    'role' => 'owner',
                    'status' => WorkspaceUser::STATUS_ACCEPTED,
                    'invitation_token' => null,
                    'invited_at' => $existing?->invited_at,
                    'accepted_at' => $existing?->accepted_at ?? now(),
                ];

                continue;
            }

            $role = $member['pivot']['role'] ?? $existing?->role ?? 'member';

            if ($existing && $existing->status === WorkspaceUser::STATUS_ACCEPTED) {
                $syncData[$id] = [
                    'role' => $role === 'owner' ? 'member' : $role,
                    'status' => WorkspaceUser::STATUS_ACCEPTED,
                    'invitation_token' => null,
                    'invited_at' => $existing->invited_at,
                    'accepted_at' => $existing->accepted_at,
                ];

                continue;
            }

            $token = $existing?->invitation_token ?? Str::random(64);

            $syncData[$id] = [
                'role' => $role === 'owner' ? 'member' : $role,
                'status' => WorkspaceUser::STATUS_PENDING,
                'invitation_token' => $token,
                'invited_at' => $existing?->invited_at ?? now(),
                'accepted_at' => null,
            ];
        }

        if (! isset($syncData[$workspace->owner_id])) {
            $ownerPivot = $existingPivots->get($workspace->owner_id);

            $syncData[$workspace->owner_id] = [
                'role' => 'owner',
                'status' => WorkspaceUser::STATUS_ACCEPTED,
                'invitation_token' => null,
                'invited_at' => $ownerPivot?->invited_at,
                'accepted_at' => $ownerPivot?->accepted_at ?? now(),
            ];
        }

        $workspace->members()->sync($syncData);

        $newInviteeIds = collect($syncData)
            ->filter(fn (array $pivot, int $userId) => ! $existingPivots->has($userId)
                && ($pivot['status'] ?? null) === WorkspaceUser::STATUS_PENDING)
            ->keys()
            ->all();

        if ($newInviteeIds === []) {
            return;
        }

        User::query()
            ->whereIn('id', $newInviteeIds)
            ->get()
            ->each(function (User $user) use ($workspace, $syncData): void {
                $this->queueInvitationEmail(
                    $workspace,
                    $user,
                    $syncData[$user->id]['invitation_token'],
                );
            });
    }

    public function acceptInvitation(string $token): Workspace
    {
        $membership = WorkspaceUser::query()
            ->where('invitation_token', $token)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Invitation not found or already used.');
        }

        if ((int) $membership->user_id !== (int) Auth::id()) {
            throw new AccessDeniedHttpException('This invitation was sent to a different account.');
        }

        $workspace = $membership->workspace()->with(['members', 'statuses', 'tags', 'projects'])->firstOrFail();

        if ($membership->status === WorkspaceUser::STATUS_ACCEPTED) {
            return $workspace;
        }

        $membership->update([
            'status' => WorkspaceUser::STATUS_ACCEPTED,
            'accepted_at' => now(),
        ]);

        $user = Auth::user();

        Mail::to($user->email)->queue(new WorkspaceInvitationAccepted(
            $workspace->fresh(['members', 'statuses', 'tags', 'projects']),
            $user,
            rtrim((string) config('app.frontend_url'), '/').'/workspaces/'.$workspace->slug,
        ));

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    protected function queueInvitationEmail(Workspace $workspace, User $user, string $token): void
    {
        $acceptUrl = rtrim((string) config('app.frontend_url'), '/')
            .'/invitations/accept/'.$token;

        Mail::to($user->email)->queue(new WorkspaceInvitation($workspace, $user, $acceptUrl));
    }
}
