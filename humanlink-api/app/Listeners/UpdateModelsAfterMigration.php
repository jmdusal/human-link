<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Support\Facades\Artisan;

class UpdateModelsAfterMigration
{
    public function handle(MigrationsEnded $event): void
    {
        // Only run in local development
        if (app()->environment('local')) {
            // --write updates the model files with @property docblocks
            Artisan::call('ide-helper:models', ['--write' => true]);
        }
    }
}
