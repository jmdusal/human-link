<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->decimal('overtime_pay', 12, 2)->default(0)->after('allowance_pay');
            $table->decimal('thirteenth_month_pay', 12, 2)->default(0)->after('overtime_pay');
            $table->decimal('sss_ee', 12, 2)->default(0)->after('gross_pay');
            $table->decimal('sss_er', 12, 2)->default(0)->after('sss_ee');
            $table->decimal('philhealth_ee', 12, 2)->default(0)->after('sss_er');
            $table->decimal('philhealth_er', 12, 2)->default(0)->after('philhealth_ee');
            $table->decimal('pagibig_ee', 12, 2)->default(0)->after('philhealth_er');
            $table->decimal('pagibig_er', 12, 2)->default(0)->after('pagibig_ee');
            $table->decimal('withholding_tax', 12, 2)->default(0)->after('pagibig_er');
            $table->decimal('other_deductions', 12, 2)->default(0)->after('withholding_tax');
            $table->decimal('total_deductions', 12, 2)->default(0)->after('other_deductions');
            $table->decimal('net_pay', 12, 2)->default(0)->after('total_deductions');
        });
    }

    public function down(): void
    {
        Schema::table('payslips', function (Blueprint $table) {
            $table->dropColumn([
                'overtime_pay',
                'thirteenth_month_pay',
                'sss_ee',
                'sss_er',
                'philhealth_ee',
                'philhealth_er',
                'pagibig_ee',
                'pagibig_er',
                'withholding_tax',
                'other_deductions',
                'total_deductions',
                'net_pay',
            ]);
        });
    }
};
