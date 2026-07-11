<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL enum → string so we can add `hr` without brittle ALTER ENUM.
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY user_type VARCHAR(32) NULL");
        }
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::table('users')
                ->where('user_type', 'hr')
                ->update(['user_type' => null]);

            DB::statement("ALTER TABLE users MODIFY user_type ENUM('employee', 'manager') NULL");
        }
    }
};
