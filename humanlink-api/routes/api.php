<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\LeavePolicyController;
use App\Http\Controllers\Api\PositionController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserTypeController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\LeaveBalanceController;
use App\Http\Controllers\Api\LeaveController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\TaskController;
use App\Http\Controllers\Api\WorkspaceController;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\TaskCommentController;
use App\Http\Controllers\Api\TaskAttachmentController;
use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AttendanceDisputeController;
use App\Http\Controllers\Api\PayrollController;
use App\Http\Controllers\Api\PayrollDeductionController;
use App\Http\Controllers\Api\LeaveRequestController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\EmployeeLifecycleController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserDocumentController;
use App\Http\Controllers\Api\ContractTemplateController;
use App\Http\Controllers\Api\IdCardTemplateController;
use App\Http\Controllers\Api\CompanyController;

Route::group(['middleware' => ['web']], function () {
    Route::post('/login', [AuthenticationController::class, 'login']);
    Route::post('/login/two-factor', [AuthenticationController::class, 'twoFactorLogin']);
    Route::post('/forgot-password', [AuthenticationController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthenticationController::class, 'resetPassword']);
    Route::get('/email/verify/{id}/{hash}', [AuthenticationController::class, 'verifyEmail'])
        ->middleware(['signed'])
        ->name('verification.verify');
});

// Authenticated routes
Route::middleware('auth:sanctum', 'permission')->group(function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user()->load([
            'company:id,name,slug,legal_name,timezone',
            'assignedUserType:id,name,slug,access_scope',
        ]);

        return response()->json([
            'user' => $user,
            'roles' => $user->getRoleNames(),
            'permissions' => $user->getAllPermissions()->pluck('name'),
        ]);
    });
    Route::post('/logout', [AuthenticationController::class, 'logout']);
    Route::post('/email/verification-notification', [AuthenticationController::class, 'sendVerificationEmail'])
        ->name('me.sendVerificationEmail');
    Route::post('/me/two-factor', [AuthenticationController::class, 'enableTwoFactor'])
        ->name('me.twoFactorEnable');
    Route::post('/me/two-factor/confirm', [AuthenticationController::class, 'confirmTwoFactor'])
        ->name('me.twoFactorConfirm');
    Route::delete('/me/two-factor', [AuthenticationController::class, 'disableTwoFactor'])
        ->name('me.twoFactorDisable');

    Route::controller(MeController::class)->prefix('me')->name('me.')->group(function () {
        Route::get('/', 'show')->name('show');
        Route::put('/', 'update')->name('update');
        Route::patch('/', 'update')->name('patch');
        Route::post('/documents/generate-contract', 'generateContract')->name('generateContract');
        Route::post('/documents/generate-id', 'generateId')->name('generateId');
    });

    Route::controller(CompanyController::class)->prefix('companies')->name('companies.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/current', 'current')->name('current');
        Route::put('/current', 'updateCurrent')->name('updateCurrent');
        Route::post('/switch', 'switchCompany')->name('switch');
        Route::get('/{company}', 'show')->name('show');
        Route::put('/{company}', 'update')->name('update');
    });

    Route::controller(DashboardController::class)->prefix('dashboard')->name('dashboard.')->group(function () {
        Route::get('/', 'summary')->name('summary');
    });

    Route::controller(NotificationController::class)->prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', 'index')->name('fetch');
        Route::post('/read-all', 'markAllAsRead')->name('readAll');
        Route::post('/{id}/read', 'markAsRead')->name('read');
    });

    Route::controller(ActivityLogController::class)->prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(UserController::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/managers', 'managers')->name('managers');
        Route::post('/', 'store')->name('store');
        Route::get('/{user}', 'show')->name('show');
        Route::put('/{user}', 'update')->name('update');
        Route::delete('/{user}', 'destroy')->name('destroy');
        Route::post('/{user}/resend-invite', 'resendInvite')->name('resendInvite');
        Route::post('/{user}/force-password-reset', 'forcePasswordReset')->name('forcePasswordReset');
        Route::post('/{user}/deactivate', 'deactivate')->name('deactivate');
        Route::post('/{user}/activate', 'activate')->name('activate');

        Route::get('/workspace/{workspace}', 'getWorkspaceUsers')->name('workspace');
        Route::get('/project/{project}', 'getProjectUsers')->name('project');
    });

    Route::controller(PermissionController::class)->prefix('permissions')->name('permissions.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{permission}', 'update')->name('update');
        Route::delete('/{permission}', 'destroy')->name('destroy');
    });

    Route::controller(RoleController::class)->prefix('roles')->name('roles.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{role}', 'update')->name('update');
        Route::delete('/{role}', 'destroy')->name('destroy');
    });

    Route::controller(UserTypeController::class)->prefix('user-types')->name('user-types.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{userType}', 'update')->name('update');
        Route::delete('/{userType}', 'destroy')->name('destroy');
    });

    Route::controller(WorkspaceController::class)->prefix('workspaces')->name('workspaces.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/invitations/{token}', 'showInvitation')->name('showInvitation');
        Route::post('/invitations/{token}/accept', 'acceptInvitation')->name('acceptInvitation');
        Route::post('/invitations/{token}/decline', 'declineInvitation')->name('declineInvitation');
        Route::post('/{workspace}/members', 'inviteMember')->name('inviteMember');
        Route::patch('/{workspace}/members/{user}', 'changeMemberRole')->name('changeMemberRole');
        Route::delete('/{workspace}/members/{user}', 'removeMember')->name('removeMember');
        Route::post('/{workspace}/members/{user}/resend-invitation', 'resendInvitation')->name('resendInvitation');
        Route::delete('/{workspace}/members/{user}/invitation', 'cancelInvitation')->name('cancelInvitation');
        Route::post('/{workspace}/leave', 'leave')->name('leave');
        Route::post('/{workspace}/transfer-ownership', 'transferOwnership')->name('transferOwnership');
        Route::post('/{workspace}/archive', 'archive')->name('archive');
        Route::post('/{workspace}/restore', 'restore')->name('restore');
        Route::get('/{workspace}/activity', 'activity')->name('activity');
        Route::get('/{workspace}/tasks', [TaskController::class, 'listByWorkspace'])->name('tasks');
        Route::put('/{workspace}', 'update')->name('update');
        Route::delete('/{workspace}', 'destroy')->name('destroy');
        Route::get('/{slug}', 'showBySlug')->name('show');
    });

    Route::controller(ProjectController::class)->prefix('projects')->name('projects.')->group(function () {
        Route::get('/{workspace}', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{project}', 'update')->name('update');
        Route::post('/{project}/archive', 'archive')->name('archive');
        Route::post('/{project}/restore', 'restore')->name('restore');
        Route::delete('/{project}', 'destroy')->name('destroy');
    });

    Route::controller(TaskController::class)->prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{task}', 'update')->name('update');
        Route::delete('/{task}', 'destroy')->name('destroy');
        Route::patch('/{task}/position', 'updatePosition')->name('updatePosition');
    });

    Route::controller(TaskAttachmentController::class)->prefix('tasks')->name('tasks.')->group(function () {
        Route::get('/{task}/attachments', 'index')->name('attachmentsIndex');
        Route::post('/{task}/attachments', 'store')->name('storeAttachment');
        Route::delete('/attachments/{attachment}', 'destroy')->name('destroyAttachment');
    });

    Route::controller(TaskCommentController::class)->prefix('taskComments')->name('taskComments.')->group(function () {
        Route::post('/{task}', 'store')->name('store');
        Route::put('/{comment}', 'update')->name('update');
        Route::delete('/{comment}', 'destroy')->name('destroy');
    });

    Route::controller(TagController::class)->prefix('tags')->name('tags.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{tag}', 'update')->name('update');
        Route::delete('/{tag}', 'destroy')->name('destroy');
    });

    Route::controller(StatusController::class)->prefix('statuses')->name('statuses.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/reorder', 'reorder')->name('reorder');
        Route::put('/{status}', 'update')->name('update');
        Route::delete('/{status}', 'destroy')->name('destroy');

    });

    Route::controller(ScheduleController::class)->prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::get('/{schedule}', 'show')->name('show');
        Route::put('/{schedule}', 'update')->name('update');
        Route::delete('/{schedule}', 'destroy')->name('destroy');
    });

    Route::controller(LeavePolicyController::class)->prefix('leave-policies')->name('leave-policies.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{leavePolicy}', 'update')->name('update');
        Route::delete('/{leavePolicy}', 'destroy')->name('destroy');
    });

    Route::controller(DepartmentController::class)->prefix('departments')->name('departments.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{department}', 'update')->name('update');
        Route::delete('/{department}', 'destroy')->name('destroy');
    });

    Route::controller(PositionController::class)->prefix('positions')->name('positions.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{position}', 'update')->name('update');
        Route::delete('/{position}', 'destroy')->name('destroy');
    });

    Route::controller(ContractTemplateController::class)->prefix('contract-templates')->name('contract-templates.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/preview', 'previewDraft')->name('previewDraft');
        Route::get('/{contractTemplate}/preview', 'preview')->name('preview');
        Route::put('/{contractTemplate}', 'update')->name('update');
        Route::delete('/{contractTemplate}', 'destroy')->name('destroy');
    });

    Route::controller(IdCardTemplateController::class)->prefix('id-card-templates')->name('id-card-templates.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/preview', 'previewDraft')->name('previewDraft');
        Route::get('/{idCardTemplate}/preview', 'preview')->name('preview');
        Route::put('/{idCardTemplate}', 'update')->name('update');
        Route::delete('/{idCardTemplate}', 'destroy')->name('destroy');
    });

    Route::controller(LeaveBalanceController::class)->prefix('leave-balances')->name('leave-balances.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{leaveBalance}', 'update')->name('update');
        Route::delete('/{leaveBalance}', 'destroy')->name('destroy');
    });

    Route::controller(LeaveController::class)->prefix('leaves')->name('leaves.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(LeaveRequestController::class)->prefix('leave-requests')->name('leave-requests.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/policy-options', 'policyOptions')->name('policyOptions');
        Route::get('/calendar', 'calendar')->name('calendar');
        Route::post('/', 'store')->name('store');
        Route::get('/{leaveRequest}', 'show')->name('show');
        Route::get('/{leaveRequest}/conflicts', 'conflicts')->name('conflicts');
        Route::put('/{leaveRequest}', 'update')->name('update');
        Route::post('/{leaveRequest}/approve', 'approve')->name('approve');
        Route::post('/{leaveRequest}/reject', 'reject')->name('reject');
        Route::post('/{leaveRequest}/cancel', 'cancel')->name('cancel');
        Route::delete('/{leaveRequest}', 'destroy')->name('destroy');
    });

    Route::controller(AttendanceController::class)->prefix('attendances')->name('attendances.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::get('/status', 'status')->name('status');
        Route::post('/start', 'start')->name('start');
        Route::post('/pause', 'pause')->name('pause');
        Route::post('/resume', 'resume')->name('resume');
        Route::post('/end', 'end')->name('end');
        Route::post('/continue', 'continueAttendance')->name('continue');
    });

    Route::controller(AttendanceDisputeController::class)->prefix('attendance-disputes')->name('attendance-disputes.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/{attendanceDispute}/approve', 'approve')->name('approve');
        Route::post('/{attendanceDispute}/reject', 'reject')->name('reject');
    });

    Route::controller(PayrollController::class)->prefix('payrolls')->name('payrolls.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/generate', 'generate')->name('generate');
        Route::post('/generate-individual', 'generateIndividual')->name('generateIndividual');
        Route::post('/generate-13th-month', 'generateThirteenthMonth')->name('generateThirteenthMonth');
        Route::post('/{payslip}/adjustments', 'storeAdjustment')->name('storeAdjustment');
        Route::delete('/{payslip}/adjustments/{adjustment}', 'destroyAdjustment')->name('destroyAdjustment');
        Route::get('/{payslip}/pdf', 'pdf')->name('pdf');
        Route::get('/{payslip}', 'show')->name('show');
        Route::delete('/{payslip}', 'destroy')->name('destroy');
    });

    Route::controller(PayrollDeductionController::class)->prefix('payroll-deductions')->name('payroll-deductions.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{payrollDeduction}', 'update')->name('update');
        Route::delete('/{payrollDeduction}', 'destroy')->name('destroy');
    });

    Route::controller(ReportController::class)->prefix('reports')->name('reports.')->group(function () {
        Route::get('/attendance-summary', 'attendanceSummary')->name('attendanceSummary');
        Route::get('/leave-utilization', 'leaveUtilization')->name('leaveUtilization');
        Route::get('/payroll-register', 'payrollRegister')->name('payrollRegister');
    });

    Route::controller(EmployeeLifecycleController::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/{user}/lifecycle', 'show')->name('lifecycle');
        Route::post('/{user}/lifecycle/items/{item}/toggle', 'toggleItem')->name('toggleLifecycleItem');
        Route::post('/{user}/offboard', 'offboard')->name('offboard');
        Route::post('/{user}/reonboard', 'reonboard')->name('reonboard');
    });

    Route::controller(UserDocumentController::class)->prefix('users/{user}/documents')->name('users.documents.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/generate-contract', 'generateContract')->name('generateContract');
        Route::post('/generate-id', 'generateId')->name('generateId');
        Route::delete('/{document}', 'destroy')->name('destroy');
    });
});
