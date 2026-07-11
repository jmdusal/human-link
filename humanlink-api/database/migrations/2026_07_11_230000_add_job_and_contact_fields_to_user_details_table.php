<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->string('job_title')->nullable()->after('tin');
            $table->string('department')->nullable()->after('job_title');
            $table->string('employment_type')->nullable()->after('department');
            $table->string('mobile', 50)->nullable()->after('employment_type');
            $table->string('emergency_contact_name')->nullable()->after('mobile');
            $table->string('emergency_contact_phone', 50)->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_relationship', 100)->nullable()->after('emergency_contact_phone');
        });
    }

    public function down(): void
    {
        Schema::table('user_details', function (Blueprint $table) {
            $table->dropColumn([
                'job_title',
                'department',
                'employment_type',
                'mobile',
                'emergency_contact_name',
                'emergency_contact_phone',
                'emergency_contact_relationship',
            ]);
        });
    }
};
