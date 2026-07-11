<?php

declare(strict_types=1);

namespace App\Services\Workspace\Concerns;

use App\Mail\WorkspaceInvitation;
use App\Mail\WorkspaceInvitationAccepted;
use App\Models\User;
use App\Models\Workspace;
use App\Models\WorkspaceUser;
use App\Notifications\WorkspaceInvitationAcceptedNotification;
use App\Notifications\WorkspaceInvitationNotification;
use App\Notifications\WorkspaceRoleChangedNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
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
            $this->notifyInvitation($workspace, $user, $token);
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
                $token = $syncData[$user->id]['invitation_token'];
                $this->queueInvitationEmail($workspace, $user, $token);
                $this->notifyInvitation($workspace, $user, $token);
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

        $this->assertInvitationIsValid($membership);

        if ((int) $membership->user_id !== (int) Auth::id()) {
            throw new AccessDeniedHttpException('This invitation was sent to a different account.');
        }

        $workspace = $membership->workspace()->with(['members', 'statuses', 'tags', 'projects'])->firstOrFail();

        if ($membership->status === WorkspaceUser::STATUS_ACCEPTED) {
            return $workspace;
        }

        $membership->update([
            'status' => WorkspaceUser::STATUS_ACCEPTED,
            'invitation_token' => null,
            'accepted_at' => now(),
        ]);

        $user = Auth::user();

        Mail::to($user->email)->queue(new WorkspaceInvitationAccepted(
            $workspace->fresh(['members', 'statuses', 'tags', 'projects']),
            $user,
            rtrim((string) config('app.frontend_url'), '/').'/workspaces/'.$workspace->slug,
        ));

        $this->notifyInvitationAccepted($workspace, $user);

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function declineInvitation(string $token): void
    {
        $membership = WorkspaceUser::query()
            ->where('invitation_token', $token)
            ->where('status', WorkspaceUser::STATUS_PENDING)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Invitation not found or already used.');
        }

        $this->assertInvitationIsValid($membership);

        if ((int) $membership->user_id !== (int) Auth::id()) {
            throw new AccessDeniedHttpException('This invitation was sent to a different account.');
        }

        $membership->delete();
    }

    public function resendInvitation(Workspace $workspace, User $user): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $membership || $membership->status !== WorkspaceUser::STATUS_PENDING) {
            throw new NotFoundHttpException('No pending invitation found for this user.');
        }

        $token = Str::random(64);

        $membership->update([
            'invitation_token' => $token,
            'invited_at' => now(),
        ]);

        $this->queueInvitationEmail($workspace, $user, $token);
        $this->notifyInvitation($workspace, $user, $token);

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function cancelInvitation(Workspace $workspace, User $user): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        if ((int) $user->id === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('Cannot cancel the workspace owner membership.');
        }

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->where('status', WorkspaceUser::STATUS_PENDING)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('No pending invitation found for this user.');
        }

        $membership->delete();

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function leave(Workspace $workspace): void
    {
        $userId = (int) Auth::id();

        if ($userId === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('Owners cannot leave the workspace. Transfer ownership or delete it instead.');
        }

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $userId)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('You are not a member of this workspace.');
        }

        $membership->delete();
    }

    public function inviteMember(Workspace $workspace, int $userId, string $role = 'member'): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        if ($userId === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('The workspace owner is already a member.');
        }

        $role = $role === 'owner' ? 'member' : $role;
        if (! in_array($role, ['admin', 'member'], true)) {
            $role = 'member';
        }

        $user = User::query()->findOrFail($userId);
        $existing = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $userId)
            ->first();

        if ($existing?->status === WorkspaceUser::STATUS_ACCEPTED) {
            throw new AccessDeniedHttpException('User is already a member of this workspace.');
        }

        $token = Str::random(64);

        if ($existing) {
            $existing->update([
                'role' => $role,
                'status' => WorkspaceUser::STATUS_PENDING,
                'invitation_token' => $token,
                'invited_at' => now(),
                'accepted_at' => null,
            ]);
        } else {
            $workspace->members()->attach($userId, [
                'role' => $role,
                'status' => WorkspaceUser::STATUS_PENDING,
                'invitation_token' => $token,
                'invited_at' => now(),
            ]);
        }

        $this->queueInvitationEmail($workspace, $user, $token);
        $this->notifyInvitation($workspace, $user, $token);

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function removeMember(Workspace $workspace, User $user): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        if ((int) $user->id === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('Cannot remove the workspace owner.');
        }

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Member not found in this workspace.');
        }

        $membership->delete();

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function changeMemberRole(Workspace $workspace, User $user, string $role): Workspace
    {
        $this->assertCanManageWorkspace($workspace);

        if ((int) $user->id === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('Cannot change the workspace owner role.');
        }

        if (! in_array($role, ['admin', 'member'], true)) {
            throw new AccessDeniedHttpException('Role must be admin or member.');
        }

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $user->id)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('Member not found in this workspace.');
        }

        $previousRole = $membership->role;
        $membership->update(['role' => $role]);

        if ($previousRole !== $role) {
            $user->notify(new WorkspaceRoleChangedNotification(
                $workspace,
                $role,
                Auth::user(),
            ));
        }

        return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
    }

    public function transferOwnership(Workspace $workspace, User $newOwner): Workspace
    {
        $this->assertIsWorkspaceOwner($workspace);

        if ((int) $newOwner->id === (int) $workspace->owner_id) {
            throw new AccessDeniedHttpException('User is already the workspace owner.');
        }

        $membership = WorkspaceUser::query()
            ->where('workspace_id', $workspace->id)
            ->where('user_id', $newOwner->id)
            ->where('status', WorkspaceUser::STATUS_ACCEPTED)
            ->first();

        if (! $membership) {
            throw new NotFoundHttpException('New owner must be an accepted workspace member.');
        }

        $previousOwnerId = (int) $workspace->owner_id;

        return DB::transaction(function () use ($workspace, $newOwner, $membership, $previousOwnerId): Workspace {
            $membership->update(['role' => 'owner']);

            WorkspaceUser::query()
                ->where('workspace_id', $workspace->id)
                ->where('user_id', $previousOwnerId)
                ->update(['role' => 'admin']);

            $workspace->update(['owner_id' => $newOwner->id]);

            $newOwner->notify(new WorkspaceRoleChangedNotification(
                $workspace->fresh(),
                'owner',
                Auth::user(),
            ));

            $previousOwner = User::query()->find($previousOwnerId);
            $previousOwner?->notify(new WorkspaceRoleChangedNotification(
                $workspace->fresh(),
                'admin',
                Auth::user(),
            ));

            return $workspace->fresh(['members', 'statuses', 'tags', 'projects']);
        });
    }

    protected function assertInvitationIsValid(WorkspaceUser $membership): void
    {
        if (! $membership->isInvitationExpired()) {
            return;
        }

        $membership->delete();

        throw new AccessDeniedHttpException('This invitation has expired. Ask an admin to resend it.');
    }

    protected function queueInvitationEmail(Workspace $workspace, User $user, string $token): void
    {
        $acceptUrl = rtrim((string) config('app.frontend_url'), '/')
            .'/invitations/accept/'.$token;

        Mail::to($user->email)->queue(new WorkspaceInvitation($workspace, $user, $acceptUrl));
    }

    protected function notifyInvitation(Workspace $workspace, User $user, string $token): void
    {
        $invitedBy = Auth::user();

        if (! $invitedBy) {
            return;
        }

        $user->notify(new WorkspaceInvitationNotification($workspace, $invitedBy, $token));
    }

    protected function notifyInvitationAccepted(Workspace $workspace, User $member): void
    {
        $workspace->loadMissing('members');

        $recipients = $workspace->members
            ->filter(function (User $user) use ($member): bool {
                $status = $user->pivot->status ?? WorkspaceUser::STATUS_ACCEPTED;
                $role = $user->pivot->role ?? null;

                return $status === WorkspaceUser::STATUS_ACCEPTED
                    && in_array($role, ['owner', 'admin'], true)
                    && (int) $user->id !== (int) $member->id;
            })
            ->values();

        if ($recipients->isEmpty()) {
            return;
        }

        Notification::send($recipients, new WorkspaceInvitationAcceptedNotification($workspace, $member));
    }
}
