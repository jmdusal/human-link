<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_details', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->unique();
            $table->string('sss_number')->nullable();
            $table->string('philhealth_number')->nullable();
            $table->string('pagibig_number')->nullable();
            $table->string('tin')->nullable();
            $table->timestamps();
        });

        if (Schema::hasColumn('users', 'sss_number')) {
            $rows = DB::table('users')
                ->select(['id', 'sss_number', 'philhealth_number', 'pagibig_number', 'tin'])
                ->get();

            $now = now();

            foreach ($rows as $row) {
                DB::table('user_details')->insert([
                    'user_id' => $row->id,
                    'sss_number' => $row->sss_number,
                    'philhealth_number' => $row->philhealth_number,
                    'pagibig_number' => $row->pagibig_number,
                    'tin' => $row->tin,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }

            Schema::table('users', function (Blueprint $table): void {
                $table->dropColumn([
                    'sss_number',
                    'philhealth_number',
                    'pagibig_number',
                    'tin',
                ]);
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('sss_number')->nullable()->after('user_type');
            $table->string('philhealth_number')->nullable()->after('sss_number');
            $table->string('pagibig_number')->nullable()->after('philhealth_number');
            $table->string('tin')->nullable()->after('pagibig_number');
        });

        $rows = DB::table('user_details')->get();

        foreach ($rows as $row) {
            DB::table('users')
                ->where('id', $row->user_id)
                ->update([
                    'sss_number' => $row->sss_number,
                    'philhealth_number' => $row->philhealth_number,
                    'pagibig_number' => $row->pagibig_number,
                    'tin' => $row->tin,
                ]);
        }

        Schema::dropIfExists('user_details');
    }
};
