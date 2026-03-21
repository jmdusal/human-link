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

    Route::controller(LeavePolicyController::class)->prefix('leave-policies')->name('leave-policies.')->group(function () {
        Route::get('/', 'index')->name('index');
        Route::post('/', 'store')->name('store');
        Route::put('/{leavePolicy}', 'update')->name('update');
        Route::delete('/{leavePolicy}', 'destroy')->name('destroy');
    });

    Route::controller(ScheduleController::class)->prefix('schedules')->name('schedules.')->group(function () {
        Route::get('/', 'index')->name('index');
    });

});
