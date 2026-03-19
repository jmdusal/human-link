<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('monthly_rate', 15, 2);
            $table->decimal('daily_rate', 12, 2);
            $table->decimal('hourly_rate', 12, 2);
            $table->decimal('allowance_monthly', 12, 2)->default(0.00);
            $table->date('effective_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_rates');
    }
};
