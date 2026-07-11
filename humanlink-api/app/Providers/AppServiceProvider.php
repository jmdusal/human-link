<?php

declare(strict_types=1);

namespace App\Providers;

use App\Contracts\ActivityLogServiceInterface;
use App\Contracts\AttendanceServiceInterface;
use App\Contracts\AttendanceDisputeServiceInterface;
use App\Contracts\PayrollServiceInterface;
use App\Contracts\AuthServiceInterface;
use App\Contracts\ContractTemplateServiceInterface;
use App\Contracts\DashboardServiceInterface;
use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\LeaveBalanceServiceInterface;
use App\Contracts\LeavePolicyServiceInterface;
use App\Contracts\LeaveRequestServiceInterface;
use App\Contracts\LeaveServiceInterface;
use App\Contracts\PermissionServiceInterface;
use App\Contracts\ProjectServiceInterface;
use App\Contracts\ReportServiceInterface;
use App\Contracts\RoleServiceInterface;
use App\Contracts\ScheduleServiceInterface;
use App\Contracts\StatusServiceInterface;
use App\Contracts\TagServiceInterface;
use App\Contracts\TaskAttachmentServiceInterface;
use App\Contracts\TaskCommentServiceInterface;
use App\Contracts\TaskServiceInterface;
use App\Contracts\UserServiceInterface;
use App\Contracts\UserDocumentServiceInterface;
use App\Contracts\WorkspaceServiceInterface;
use App\Listeners\UpdateModelsAfterMigration;
use App\Services\ActivityLog\ActivityLogService;
use App\Services\Attendance\AttendanceService;
use App\Services\AttendanceDispute\AttendanceDisputeService;
use App\Services\Dashboard\DashboardService;
use App\Services\EmployeeLifecycle\EmployeeLifecycleService;
use App\Services\Payroll\PayrollService;
use App\Services\Auth\AuthService;
use App\Services\ContractTemplate\ContractTemplateService;
use App\Services\Leave\LeaveService;
use App\Services\LeaveBalance\LeaveBalanceService;
use App\Services\LeavePolicy\LeavePolicyService;
use App\Services\LeaveRequest\LeaveRequestService;
use App\Services\Permission\PermissionService;
use App\Services\Project\ProjectService;
use App\Services\Report\ReportService;
use App\Services\Role\RoleService;
use App\Services\Schedule\ScheduleService;
use App\Services\Status\StatusService;
use App\Services\Tag\TagService;
use App\Services\Task\TaskService;
use App\Services\TaskAttachment\TaskAttachmentService;
use App\Services\TaskComment\TaskCommentService;
use App\Services\User\UserService;
use App\Services\UserDocument\UserDocumentService;
use App\Services\Workspace\WorkspaceService;
use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if ($this->app->environment('local') && class_exists(\Laravel\Telescope\TelescopeServiceProvider::class)) {
            $this->app->register(\Laravel\Telescope\TelescopeServiceProvider::class);
            $this->app->register(TelescopeServiceProvider::class);
        }
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(UserDocumentServiceInterface::class, UserDocumentService::class);
        $this->app->bind(WorkspaceServiceInterface::class, WorkspaceService::class);
        $this->app->bind(ProjectServiceInterface::class, ProjectService::class);
        $this->app->bind(TaskServiceInterface::class, TaskService::class);
        $this->app->bind(TaskCommentServiceInterface::class, TaskCommentService::class);
        $this->app->bind(TaskAttachmentServiceInterface::class, TaskAttachmentService::class);
        $this->app->bind(TagServiceInterface::class, TagService::class);
        $this->app->bind(StatusServiceInterface::class, StatusService::class);
        $this->app->bind(ScheduleServiceInterface::class, ScheduleService::class);
        $this->app->bind(DashboardServiceInterface::class, DashboardService::class);
        $this->app->bind(ActivityLogServiceInterface::class, ActivityLogService::class);
        $this->app->bind(LeaveServiceInterface::class, LeaveService::class);
        $this->app->bind(LeavePolicyServiceInterface::class, LeavePolicyService::class);
        $this->app->bind(ContractTemplateServiceInterface::class, ContractTemplateService::class);
        $this->app->bind(LeaveBalanceServiceInterface::class, LeaveBalanceService::class);
        $this->app->bind(LeaveRequestServiceInterface::class, LeaveRequestService::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);
        $this->app->bind(PermissionServiceInterface::class, PermissionService::class);
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(AttendanceServiceInterface::class, AttendanceService::class);
        $this->app->bind(AttendanceDisputeServiceInterface::class, AttendanceDisputeService::class);
        $this->app->bind(PayrollServiceInterface::class, PayrollService::class);
        $this->app->bind(ReportServiceInterface::class, ReportService::class);
        $this->app->bind(EmployeeLifecycleServiceInterface::class, EmployeeLifecycleService::class);
    }

    public function boot(): void
    {
        Event::listen(
            MigrationsEnded::class,
            UpdateModelsAfterMigration::class,
        );
    }
}
