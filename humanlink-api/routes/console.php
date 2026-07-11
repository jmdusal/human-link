<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('attendance:notify-forgotten-timers')->dailyAt('19:00');
Schedule::command('leave:notify-pending-reminders')->dailyAt('09:00');
Schedule::command('workspaces:expire-invitations')->dailyAt('00:30');
