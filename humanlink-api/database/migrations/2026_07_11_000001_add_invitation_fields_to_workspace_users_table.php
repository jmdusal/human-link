<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workspace_users', function (Blueprint $table) {
            $table->string('status')->default('accepted')->after('role');
            $table->string('invitation_token', 64)->nullable()->unique()->after('status');
            $table->timestamp('invited_at')->nullable()->after('invitation_token');
            $table->timestamp('accepted_at')->nullable()->after('invited_at');
        });
    }

    public function down(): void
    {
        Schema::table('workspace_users', function (Blueprint $table) {
            $table->dropColumn(['status', 'invitation_token', 'invited_at', 'accepted_at']);
        });
    }
};
