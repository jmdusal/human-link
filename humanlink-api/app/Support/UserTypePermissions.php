<?php

declare(strict_types=1);

namespace App\Support;

final class UserTypePermissions
{
    /**
     * @return list<string>
     */
    public static function for(?string $userType): array
    {
        return match ($userType) {
            'hr' => self::hr(),
            'manager' => self::manager(),
            'employee' => self::employee(),
            default => [],
        };
    }

    /**
     * @return list<string>
     */
    public static function employee(): array
    {
        return [
            'workspaces-view',
            'projects-view',
            'projects-create',
            'projects-edit',
            'projects-delete',
            'tasks-view',
            'tasks-create',
            'tasks-edit',
            'leave-requests-view',
            'leave-requests-create',
            'leave-requests-edit',
            'leave-requests-delete',
            'leave-balances-view',
            'attendances-view',
            'attendances-create',
            'attendances-edit',
            'attendance-disputes-view',
            'attendance-disputes-create',
            'payrolls-view',
            'reports-view',
        ];
    }

    /**
     * @return list<string>
     */
    public static function hr(): array
    {
        return [
            'users-view',
            'users-create',
            'users-edit',
            'users-delete',
            'workspaces-view',
            'workspaces-create',
            'workspaces-edit',
            'projects-view',
            'projects-create',
            'projects-edit',
            'tasks-view',
            'tasks-create',
            'tasks-edit',
            'leaves-view',
            'leave-policies-view',
            'leave-policies-create',
            'leave-policies-edit',
            'leave-policies-delete',
            'contract-templates-view',
            'contract-templates-create',
            'contract-templates-edit',
            'contract-templates-delete',
            'leave-balances-view',
            'leave-balances-create',
            'leave-balances-edit',
            'leave-balances-delete',
            'leave-requests-view',
            'leave-requests-create',
            'leave-requests-edit',
            'leave-requests-delete',
            'leave-calendar-view',
            'schedules-view',
            'schedules-create',
            'schedules-edit',
            'schedules-delete',
            'attendances-view',
            'attendances-create',
            'attendances-edit',
            'attendances-delete',
            'attendance-disputes-view',
            'attendance-disputes-create',
            'attendance-disputes-edit',
            'attendance-disputes-delete',
            'payrolls-view',
            'payrolls-create',
            'payrolls-edit',
            'payrolls-delete',
            'payroll-deductions-view',
            'payroll-deductions-create',
            'payroll-deductions-edit',
            'payroll-deductions-delete',
            'reports-view',
            'companies-view',
            'companies-edit',
        ];
    }

    /**
     * @return list<string>
     */
    public static function manager(): array
    {
        return [
            'workspaces-view',
            'workspaces-create',
            'workspaces-edit',
            'projects-view',
            'projects-create',
            'projects-edit',
            'tasks-view',
            'tasks-create',
            'tasks-edit',
            'schedules-view',
            'schedules-create',
            'schedules-edit',
            'schedules-delete',
            'leave-requests-view',
            'leave-requests-create',
            'leave-requests-edit',
            'leave-requests-delete',
            'leave-calendar-view',
            'leave-balances-view',
            'attendances-view',
            'attendances-create',
            'attendances-edit',
            'attendance-disputes-view',
            'attendance-disputes-edit',
            'payrolls-view',
            'payroll-deductions-view',
            'reports-view',
        ];
    }
}
