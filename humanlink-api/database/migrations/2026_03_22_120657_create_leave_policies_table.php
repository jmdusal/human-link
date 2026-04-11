<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_policies', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->decimal('default_credits', 5, 2)->default(0.00);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_paid')->default(true);
            $table->boolean('is_cashable')->default(false);
            $table->boolean('allow_carry_over')->default(false);
            $table->decimal('max_carry_over', 5, 2)->default(0.00);
            $table->boolean('requires_attachment')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_policies');
    }
};
