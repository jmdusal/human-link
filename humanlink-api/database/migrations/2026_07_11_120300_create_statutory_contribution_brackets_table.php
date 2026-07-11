<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statutory_contribution_brackets', function (Blueprint $table) {
            $table->id();
            $table->string('agency'); // sss, philhealth, pagibig, withholding_tax
            $table->date('effective_date');
            $table->decimal('min_compensation', 12, 2)->default(0);
            $table->decimal('max_compensation', 12, 2)->nullable();
            $table->decimal('employee_rate', 8, 6)->nullable();
            $table->decimal('employer_rate', 8, 6)->nullable();
            $table->decimal('employee_amount', 12, 2)->nullable();
            $table->decimal('employer_amount', 12, 2)->nullable();
            $table->decimal('base_amount', 12, 2)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['agency', 'effective_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statutory_contribution_brackets');
    }
};
