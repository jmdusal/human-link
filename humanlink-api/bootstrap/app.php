<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();

        // $middleware->encryptCookies(except: [
        //     'XSRF-TOKEN',
        //     'laravel_session'
        // ]);

        $middleware->alias([
            'permission' => \App\Http\Middleware\AuthorizePermission::class,
        ]);

        $middleware->validateCsrfTokens(except: [
            'api/login',
            'api/logout',
            'sanctum/csrf-cookie',
            'broadcasting/auth',
        ]);

        // $middleware->validateCsrfTokens(except: [
        //     // 'api/login', // Only uncomment this if you want to bypass CSRF entirely to test
        // ]);

        // $middleware->alias([
        //     'sanctum' => \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        // ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
