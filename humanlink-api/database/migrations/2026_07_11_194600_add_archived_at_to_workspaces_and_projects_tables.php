<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspaces', function (Blueprint $table): void {
            $table->timestamp('archived_at')->nullable()->after('owner_id');
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->timestamp('archived_at')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('workspaces', function (Blueprint $table): void {
            $table->dropColumn('archived_at');
        });

        Schema::table('projects', function (Blueprint $table): void {
            $table->dropColumn('archived_at');
        });
    }
};
