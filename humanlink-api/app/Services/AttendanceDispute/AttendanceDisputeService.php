<?php

declare(strict_types=1);

namespace App\Services\AttendanceDispute;

use App\Contracts\AttendanceDisputeServiceInterface;
use App\Models\Attendance;
use App\Models\AttendanceDispute;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceDisputeService implements AttendanceDisputeServiceInterface
{
    public function list(): Collection
    {
        $query = AttendanceDispute::query()
            ->with([
                'attendance',
                'user:id,name,email',
                'reviewer:id,name,email',
            ])
            ->latest();

        if (! $this->canManage()) {
            $query->where('user_id', Auth::id());
        }

        return $query->get();
    }

    public function create(array $data): AttendanceDispute
    {
        $actor = Auth::user();

        if (! $actor) {
            abort(401);
        }

        $attendance = Attendance::query()->findOrFail((int) $data['attendance_id']);

        if ((int) $attendance->user_id !== (int) $actor->id && ! $this->canManage($actor)) {
            abort(403, 'You can only dispute your own attendance.');
        }

        if ((int) $attendance->user_id !== (int) $actor->id) {
            abort(403, 'Only the attendance owner can create a dispute.');
        }

        $existing = AttendanceDispute::query()
            ->where('attendance_id', $attendance->id)
            ->where('status', 'pending')
            ->exists();

        if ($existing) {
            throw ValidationException::withMessages([
                'attendance_id' => ['A pending dispute already exists for this attendance.'],
            ]);
        }

        return AttendanceDispute::query()->create([
            'attendance_id' => $attendance->id,
            'user_id' => $actor->id,
            'reason' => $data['reason'],
            'proposed_total_ms' => $data['proposed_total_ms'] ?? null,
            'proposed_overtime_ms' => $data['proposed_overtime_ms'] ?? null,
            'status' => 'pending',
        ])->load(['attendance', 'user:id,name,email']);
    }

    public function approve(AttendanceDispute $dispute, array $data = []): AttendanceDispute
    {
        if (! $this->canManage()) {
            abort(403, 'You are not allowed to approve attendance disputes.');
        }

        if (! $dispute->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending disputes can be approved.'],
            ]);
        }

        return DB::transaction(function () use ($dispute, $data): AttendanceDispute {
            $attendance = Attendance::query()
                ->whereKey($dispute->attendance_id)
                ->lockForUpdate()
                ->firstOrFail();

            $updates = [];

            if ($dispute->proposed_total_ms !== null) {
                $updates['total_ms'] = $dispute->proposed_total_ms;
            }

            if ($dispute->proposed_overtime_ms !== null) {
                $updates['overtime_ms'] = $dispute->proposed_overtime_ms;
            }

            if ($updates !== []) {
                $attendance->update($updates);
            }

            $dispute->update([
                'status' => 'approved',
                'resolution_note' => $data['resolution_note'] ?? $dispute->resolution_note,
                'reviewed_by' => Auth::id(),
                'reviewed_at' => now(),
            ]);

            return $dispute->fresh()->load(['attendance', 'user:id,name,email', 'reviewer:id,name,email']);
        });
    }

    public function reject(AttendanceDispute $dispute, array $data = []): AttendanceDispute
    {
        if (! $this->canManage()) {
            abort(403, 'You are not allowed to reject attendance disputes.');
        }

        if (! $dispute->isPending()) {
            throw ValidationException::withMessages([
                'status' => ['Only pending disputes can be rejected.'],
            ]);
        }

        $dispute->update([
            'status' => 'rejected',
            'resolution_note' => $data['resolution_note'] ?? null,
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return $dispute->fresh()->load(['attendance', 'user:id,name,email', 'reviewer:id,name,email']);
    }

    protected function canManage(?User $user = null): bool
    {
        $user ??= Auth::user();

        if (! $user) {
            return false;
        }

        return $user->hasRole('super-admin')
            || $user->hasRole('hr-manager')
            || $user->can('users-edit');
    }
}
