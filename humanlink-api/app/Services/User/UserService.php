<?php

declare(strict_types=1);

namespace App\Services\User;

use App\Contracts\UserServiceInterface;
use App\Contracts\EmployeeLifecycleServiceInterface;
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

    public function __construct(
        private EmployeeLifecycleServiceInterface $lifecycleService
    ) {}

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
            $payload = $this->userPayload($data);
            if (empty($payload['hired_at'])) {
                $payload['hired_at'] = now()->toDateString();
            }

            $user = User::create($payload);

            $this->assignActiveLeaveBalances($user);
            $this->createUserRate($user, $data);
            $this->createUserSchedule($user, $data);

            $user->assignRole($data['role'] ?? 'user');
            $user->notify(new NewActivityNotification());
            $this->lifecycleService->ensureOnboardChecklist($user);

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

    public function listManagers(): Collection
    {
        return User::query()
            ->where('user_type', 'manager')
            ->where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'user_type']);
    }

    protected function userPayload(array $data): array
    {
        return array_intersect_key($data, array_flip([
            'name',
            'email',
            'password',
            'status',
            'user_type',
            'sss_number',
            'philhealth_number',
            'pagibig_number',
            'tin',
            'hired_at',
            'terminated_at',
        ]));
    }
}
