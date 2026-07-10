<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Contracts\UserServiceInterface;
use App\Models\Project;
use App\Models\User;
use App\Models\Workspace;
use App\Notifications\NewActivityNotification;
use App\Services\User\Concerns\ManagesUserLeaveBalances;
use App\Services\User\Concerns\ManagesUserRates;
use App\Services\User\Concerns\ManagesUserSchedules;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class UserService implements UserServiceInterface
{
    use ManagesUserLeaveBalances;
    use ManagesUserRates;
    use ManagesUserSchedules;

    public function list(): Collection
    {
        return User::query()
            ->with(['roles', 'rate', 'schedule'])
            ->whereDoesntHave('roles', function ($query): void {
                $query->where('name', 'super-admin');
            })
            ->latest()
            ->get();
    }

    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = User::create($this->userPayload($data));

            $this->assignActiveLeaveBalances($user);
            $this->createUserRate($user, $data);
            $this->createUserSchedule($user, $data);

            $user->assignRole($data['role'] ?? 'user');
            $user->notify(new NewActivityNotification());

            return $user->load(['roles', 'rate', 'schedule', 'leaveBalances.leavePolicy']);
        });
    }

    public function update(User $user, array $data): User
    {
        return DB::transaction(function () use ($user, $data): User {
            $user->update($this->userPayload($data));

            if (array_key_exists('role', $data)) {
                $user->syncRoles($data['role']);
            }

            $this->syncUserRate($user, $data);
            $this->syncUserSchedule($user, $data);

            return $user->load(['roles', 'rate', 'schedule']);
        });
    }

    public function delete(User $user): void
    {
        $user->delete();
    }

    public function listByWorkspace(Workspace $workspace): Collection
    {
        return $workspace->members()->get();
    }

    public function listByProject(Project $project): Collection
    {
        return $project->projectMembers()->get();
    }

    protected function userPayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'name',
            'email',
            'password',
            'status',
        ]));
    }
}
