<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Database\Events\MigrationsEnded;
use App\Listeners\UpdateModelsAfterMigration;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Cache\RateLimiting\Limit;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(
            MigrationsEnded::class,
            UpdateModelsAfterMigration::class,
        );

        // RateLimiter::for('emails', function (object $job) {
        //     return Limit::perMinute(20);
        // });

    }
}
