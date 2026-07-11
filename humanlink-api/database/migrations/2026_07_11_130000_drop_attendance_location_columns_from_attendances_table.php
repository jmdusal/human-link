<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $columns = array_values(array_filter(
            [
                'start_ip',
                'end_ip',
                'start_latitude',
                'start_longitude',
                'end_latitude',
                'end_longitude',
            ],
            fn (string $column): bool => Schema::hasColumn('attendances', $column),
        ));

        if ($columns === []) {
            return;
        }

        Schema::table('attendances', function (Blueprint $table) use ($columns) {
            $table->dropColumn($columns);
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            if (! Schema::hasColumn('attendances', 'start_ip')) {
                $table->string('start_ip', 45)->nullable()->after('scheduled_end');
            }
            if (! Schema::hasColumn('attendances', 'end_ip')) {
                $table->string('end_ip', 45)->nullable()->after('start_ip');
            }
            if (! Schema::hasColumn('attendances', 'start_latitude')) {
                $table->decimal('start_latitude', 10, 7)->nullable()->after('end_ip');
            }
            if (! Schema::hasColumn('attendances', 'start_longitude')) {
                $table->decimal('start_longitude', 10, 7)->nullable()->after('start_latitude');
            }
            if (! Schema::hasColumn('attendances', 'end_latitude')) {
                $table->decimal('end_latitude', 10, 7)->nullable()->after('start_longitude');
            }
            if (! Schema::hasColumn('attendances', 'end_longitude')) {
                $table->decimal('end_longitude', 10, 7)->nullable()->after('end_latitude');
            }
        });
    }
};
