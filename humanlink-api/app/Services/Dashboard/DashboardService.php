<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Contracts\DashboardServiceInterface;
use App\Models\Attendance;
use App\Models\AttendanceDispute;
use App\Models\LeaveRequest;
use App\Models\Payslip;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

class DashboardService implements DashboardServiceInterface
{
    public function summary(): array
    {
        $actor = Auth::user();

        if (! $actor) {
            abort(401);
        }

        if ($this->canViewAdminDashboard($actor)) {
            return [
                'scope' => 'admin',
                'kpis' => $this->adminKpis(),
                'leave_activity' => $this->weeklyLeaveActivity(),
                'role_distribution' => $this->roleDistribution(),
                'recent_activity' => $this->recentActivity(),
            ];
        }

        return [
            'scope' => 'member',
            'kpis' => $this->memberKpis($actor),
            'leave_activity' => $this->weeklyLeaveActivityForUser((int) $actor->id),
            'recent_activity' => [],
            'role_distribution' => [],
        ];
    }

    /**
     * @return array<string, int|float>
     */
    protected function adminKpis(): array
    {
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();
        $year = (int) now()->year;
        $month = (int) now()->month;

        $activeUsers = User::query()
            ->where('status', 'active')
            ->whereDoesntHave('roles', fn ($q) => $q->where('name', 'super-admin'))
            ->count();

        $workingNow = User::query()
            ->where('status', 'active')
            ->whereIn('timer_status', ['working', 'paused'])
            ->count();

        $pendingLeaves = LeaveRequest::query()
            ->where('status', 'pending')
            ->count();

        $openDisputes = AttendanceDispute::query()
            ->where('status', 'pending')
            ->count();

        $attendanceDaysMtd = Attendance::query()
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->count();

        $payslips = Payslip::query()
            ->where('year', $year)
            ->where('month', $month)
            ->get(['gross_pay', 'net_pay']);

        return [
            'active_users' => $activeUsers,
            'working_now' => $workingNow,
            'pending_leaves' => $pendingLeaves,
            'open_disputes' => $openDisputes,
            'attendance_days_mtd' => $attendanceDaysMtd,
            'payslips_this_month' => $payslips->count(),
            'gross_payroll_mtd' => round((float) $payslips->sum('gross_pay'), 2),
            'net_payroll_mtd' => round((float) $payslips->sum('net_pay'), 2),
        ];
    }

    /**
     * @return array<string, int|float|string|null>
     */
    protected function memberKpis(User $user): array
    {
        $year = (int) now()->year;
        $month = (int) now()->month;
        $monthStart = now()->startOfMonth()->toDateString();
        $monthEnd = now()->endOfMonth()->toDateString();

        return [
            'timer_status' => $user->timer_status,
            'pending_leaves' => LeaveRequest::query()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
            'attendance_days_mtd' => Attendance::query()
                ->where('user_id', $user->id)
                ->whereBetween('date', [$monthStart, $monthEnd])
                ->count(),
            'payslips_this_month' => Payslip::query()
                ->where('user_id', $user->id)
                ->where('year', $year)
                ->where('month', $month)
                ->count(),
            'open_disputes' => AttendanceDispute::query()
                ->where('user_id', $user->id)
                ->where('status', 'pending')
                ->count(),
        ];
    }

    /**
     * @return array<int, array{day: string, requests: int}>
     */
    protected function weeklyLeaveActivity(): array
    {
        $start = now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end = now()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $counts = LeaveRequest::query()
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->groupBy(fn (LeaveRequest $request): string => $request->created_at->format('D'))
            ->map->count();

        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return collect($days)->map(fn (string $day): array => [
            'day' => $day,
            'requests' => (int) ($counts[$day] ?? 0),
        ])->all();
    }

    /**
     * @return array<int, array{day: string, requests: int}>
     */
    protected function weeklyLeaveActivityForUser(int $userId): array
    {
        $start = now()->startOfWeek(Carbon::MONDAY)->startOfDay();
        $end = now()->endOfWeek(Carbon::SUNDAY)->endOfDay();

        $counts = LeaveRequest::query()
            ->where('user_id', $userId)
            ->whereBetween('created_at', [$start, $end])
            ->get(['created_at'])
            ->groupBy(fn (LeaveRequest $request): string => $request->created_at->format('D'))
            ->map->count();

        $days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return collect($days)->map(fn (string $day): array => [
            'day' => $day,
            'requests' => (int) ($counts[$day] ?? 0),
        ])->all();
    }

    /**
     * @return array<int, array{name: string, count: int}>
     */
    protected function roleDistribution(): array
    {
        return Role::query()
            ->where('name', '!=', 'super-admin')
            ->withCount('users')
            ->orderByDesc('users_count')
            ->limit(5)
            ->get()
            ->map(fn (Role $role): array => [
                'name' => $role->name,
                'count' => (int) $role->users_count,
            ])
            ->all();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function recentActivity(): array
    {
        return Activity::query()
            ->with('causer:id,name,email')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Activity $activity): array => [
                'id' => $activity->id,
                'description' => $activity->description,
                'subject_type' => class_basename((string) $activity->subject_type),
                'causer_name' => $activity->causer?->name ?? 'System',
                'time' => $activity->created_at?->diffForHumans(),
                'created_at' => $activity->created_at?->toIso8601String(),
            ])
            ->all();
    }

    protected function canViewAdminDashboard(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->isElevatedStaff() || $user->can('users-view');
    }
}
