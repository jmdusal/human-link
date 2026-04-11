<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('leave_policy_id')->constrained()->onDelete('cascade');
            $table->decimal('allowed', 5, 2);
            $table->decimal('used', 5, 2)->default(0.00);
            $table->year('year');
            $table->timestamps();

            $table->unique(['user_id', 'leave_policy_id', 'year'], 'user_policy_year_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
    }
};
