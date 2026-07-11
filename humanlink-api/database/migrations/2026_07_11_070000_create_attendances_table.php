<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->bigInteger('total_ms')->default(0);
            $table->bigInteger('late_ms')->default(0);
            $table->bigInteger('undertime_ms')->default(0);
            $table->bigInteger('overtime_ms')->default(0);
            $table->bigInteger('break_ms')->default(0);
            $table->bigInteger('required_ms')->default(0);
            $table->time('scheduled_start')->nullable();
            $table->time('scheduled_end')->nullable();
            $table->enum('status', ['working', 'paused', 'completed'])->default('working');
            $table->timestamps();

            $table->unique(['user_id', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};
