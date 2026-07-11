<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payslips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedInteger('days_worked')->default(0);
            $table->decimal('paid_leave_days', 5, 2)->default(0);
            $table->decimal('hours_worked', 8, 2)->default(0);
            $table->decimal('monthly_rate', 15, 2)->default(0);
            $table->decimal('daily_rate', 12, 2)->default(0);
            $table->decimal('hourly_rate', 12, 2)->default(0);
            $table->decimal('allowance_monthly', 12, 2)->default(0);
            $table->decimal('basic_pay', 15, 2)->default(0);
            $table->decimal('allowance_pay', 12, 2)->default(0);
            $table->decimal('overtime_pay', 12, 2)->default(0);
            $table->decimal('thirteenth_month_pay', 12, 2)->default(0);
            $table->decimal('gross_pay', 15, 2)->default(0);
            $table->decimal('sss_ee', 12, 2)->default(0);
            $table->decimal('sss_er', 12, 2)->default(0);
            $table->decimal('philhealth_ee', 12, 2)->default(0);
            $table->decimal('philhealth_er', 12, 2)->default(0);
            $table->decimal('pagibig_ee', 12, 2)->default(0);
            $table->decimal('pagibig_er', 12, 2)->default(0);
            $table->decimal('withholding_tax', 12, 2)->default(0);
            $table->decimal('other_deductions', 12, 2)->default(0);
            $table->decimal('total_deductions', 12, 2)->default(0);
            $table->decimal('net_pay', 12, 2)->default(0);
            $table->string('currency', 3)->default('PHP');
            $table->text('notes')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payslips');
    }
};
