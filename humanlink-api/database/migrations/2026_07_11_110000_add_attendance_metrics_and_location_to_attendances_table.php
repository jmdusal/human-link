<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->bigInteger('late_ms')->default(0)->after('total_ms');
            $table->bigInteger('undertime_ms')->default(0)->after('late_ms');
            $table->bigInteger('overtime_ms')->default(0)->after('undertime_ms');
            $table->bigInteger('break_ms')->default(0)->after('overtime_ms');
            $table->bigInteger('required_ms')->default(0)->after('break_ms');
            $table->time('scheduled_start')->nullable()->after('required_ms');
            $table->time('scheduled_end')->nullable()->after('scheduled_start');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'late_ms',
                'undertime_ms',
                'overtime_ms',
                'break_ms',
                'required_ms',
                'scheduled_start',
                'scheduled_end',
            ]);
        });
    }
};
