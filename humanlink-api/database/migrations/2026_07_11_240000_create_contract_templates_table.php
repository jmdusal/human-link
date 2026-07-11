<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('employment_type');
            $table->longText('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['company_id', 'employment_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_templates');
    }
};
