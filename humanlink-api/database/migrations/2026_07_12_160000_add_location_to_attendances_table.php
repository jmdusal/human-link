<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->decimal('start_latitude', 10, 7)->nullable()->after('status');
            $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            $table->decimal('start_accuracy', 8, 2)->nullable()->after('start_longitude');
            $table->decimal('end_latitude', 10, 7)->nullable()->after('start_accuracy');
            $table->decimal('end_longitude', 10, 7)->nullable()->after('end_latitude');
            $table->decimal('end_accuracy', 8, 2)->nullable()->after('end_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn([
                'start_latitude',
                'start_longitude',
                'start_accuracy',
                'end_latitude',
                'end_longitude',
                'end_accuracy',
            ]);
        });
    }
};
