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

    Route::controller(ActivityLogController::class)->prefix('activity-logs')->name('activity-logs.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

    Route::controller(UserController::class)->prefix('users')->name('users.')->group(function () {
        Route::get('/', 'index')->name('index');
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
        Route::put('/{workspace}', 'update')->name('update');
        Route::delete('/{workspace}', 'destroy')->name('destroy');
        Route::get('/{slug}', 'showBySlug');
        // Route::get('/{workspace}/projects', [ProjectController::class, 'index']);
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


});
