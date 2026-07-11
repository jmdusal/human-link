<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthenticationController;
use App\Http\Controllers\Api\LeavePolicyController;
use App\Http\Controllers\Api\PermissionController;
use App\Http\Controllers\Api\RoleController;
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

Route::group(['middleware' => ['web']], function () {
    Route::post('/login', [AuthenticationController::class, 'login']);
});

// Authenticated routes
Route::middleware('auth:sanctum', 'permission')->group(function () {
    Route::get('/user', function (Request $request) {
        // return response()->json([
        //     'id' => $request->user()->id,
        //     'name' => $request->user()->name,
        //     'email' => $request->user()->email,
        //     'roles' => $request->user()->getRoleNames(), // Spatie method
        //     'permissions' => $request->user()->getAllPermissions()->pluck('name'), // Spatie method
        // ]);
        return response()->json([
            'user' => $request->user(),
            'roles' => $request->user()->getRoleNames(),
            'permissions' => $request->user()->getAllPermissions()->pluck('name'),
        ]);
    });
    // Route::get('/user', function (Request $request) {
    //     return $request->user();
    // });
    Route::post('/logout', [AuthenticationController::class, 'logout']);

    Route::controller(MeController::class)->prefix('me')->name('me.')->group(function () {
        Route::get('/', 'show')->name('show');
        Route::put('/', 'update')->name('update');
        Route::patch('/', 'update')->name('patch');
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

    Route::controller(WorkspaceController::class)->prefix('workspaces')->name('workspaces.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::post('/invitations/{token}/accept', 'acceptInvitation')->name('acceptInvitation');
        Route::put('/{workspace}', 'update')->name('update');
        Route::delete('/{workspace}', 'destroy')->name('destroy');
        Route::get('/{slug}', 'showBySlug')->name('show');
    });

    Route::controller(ProjectController::class)->prefix('projects')->name('projects.')->group(function () {
        Route::get('/{workspace}', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{project}', 'update')->name('update');
        Route::delete('/{project}', 'destroy')->name('destroy');
        // Route::get('/{workspace}/projects', 'index')->name('index');

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
    });
});
