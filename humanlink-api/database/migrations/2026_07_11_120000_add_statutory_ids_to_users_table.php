<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sss_number')->nullable()->after('user_type');
            $table->string('philhealth_number')->nullable()->after('sss_number');
            $table->string('pagibig_number')->nullable()->after('philhealth_number');
            $table->string('tin')->nullable()->after('pagibig_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['sss_number', 'philhealth_number', 'pagibig_number', 'tin']);
        });
    }
};
