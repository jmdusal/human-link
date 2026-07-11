<?php

declare(strict_types=1);

use App\Support\DefaultContractTemplates;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contract_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employment_type')->unique();
            $table->longText('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        $now = now();

        foreach (DefaultContractTemplates::all() as $template) {
            DB::table('contract_templates')->insert([
                ...$template,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('contract_templates');
    }
};
