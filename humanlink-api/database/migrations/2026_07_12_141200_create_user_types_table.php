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
        Schema::create('user_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('slug', 64);
            $table->string('access_scope', 32)->default('self');
            $table->boolean('is_system')->default(false);
            $table->timestamps();

            $table->unique(['company_id', 'slug']);
            $table->unique(['company_id', 'name']);
            $table->index(['company_id', 'access_scope']);
        });

        Schema::create('user_type_permission', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_type_id')->constrained('user_types')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();

            $table->unique(['user_type_id', 'permission_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('user_type_id')
                ->nullable()
                ->after('user_type')
                ->constrained('user_types')
                ->nullOnDelete();
        });

        $this->seedDefaultsAndBackfill();
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_type_id');
        });

        Schema::dropIfExists('user_type_permission');
        Schema::dropIfExists('user_types');
    }

    private function seedDefaultsAndBackfill(): void
    {
        $now = now();

        foreach (['view', 'create', 'edit', 'delete'] as $action) {
            DB::table('permissions')->updateOrInsert(
                ['name' => "user-types-{$action}", 'guard_name' => 'web'],
                ['created_at' => $now, 'updated_at' => $now]
            );
        }

        $companies = DB::table('companies')->pluck('id');

        if ($companies->isEmpty()) {
            return;
        }

        $permissionIdsByName = DB::table('permissions')->pluck('id', 'name');

        $defaults = [
            'employee' => [
                'name' => 'Employee',
                'access_scope' => 'self',
                'permissions' => [
                    'workspaces-view',
                    'projects-view', 'projects-create', 'projects-edit', 'projects-delete',
                    'tasks-view', 'tasks-create', 'tasks-edit',
                    'leave-requests-view', 'leave-requests-create', 'leave-requests-edit', 'leave-requests-delete',
                    'leave-balances-view',
                    'attendances-view', 'attendances-create', 'attendances-edit',
                    'attendance-disputes-view', 'attendance-disputes-create',
                    'payrolls-view', 'reports-view',
                ],
            ],
            'hr' => [
                'name' => 'HR',
                'access_scope' => 'company',
                'permissions' => [
                    'users-view', 'users-create', 'users-edit', 'users-delete',
                    'user-types-view', 'user-types-create', 'user-types-edit', 'user-types-delete',
                    'workspaces-view', 'workspaces-create', 'workspaces-edit',
                    'projects-view', 'projects-create', 'projects-edit',
                    'tasks-view', 'tasks-create', 'tasks-edit',
                    'leaves-view',
                    'leave-policies-view', 'leave-policies-create', 'leave-policies-edit', 'leave-policies-delete',
                    'contract-templates-view', 'contract-templates-create', 'contract-templates-edit', 'contract-templates-delete',
                    'leave-balances-view', 'leave-balances-create', 'leave-balances-edit', 'leave-balances-delete',
                    'leave-requests-view', 'leave-requests-create', 'leave-requests-edit', 'leave-requests-delete',
                    'leave-calendar-view',
                    'schedules-view', 'schedules-create', 'schedules-edit', 'schedules-delete',
                    'attendances-view', 'attendances-create', 'attendances-edit', 'attendances-delete',
                    'attendance-disputes-view', 'attendance-disputes-create', 'attendance-disputes-edit', 'attendance-disputes-delete',
                    'payrolls-view', 'payrolls-create', 'payrolls-edit', 'payrolls-delete',
                    'payroll-deductions-view', 'payroll-deductions-create', 'payroll-deductions-edit', 'payroll-deductions-delete',
                    'reports-view', 'companies-view', 'companies-edit',
                ],
            ],
            'manager' => [
                'name' => 'Manager',
                'access_scope' => 'workspace',
                'permissions' => [
                    'workspaces-view', 'workspaces-create', 'workspaces-edit',
                    'projects-view', 'projects-create', 'projects-edit',
                    'tasks-view', 'tasks-create', 'tasks-edit',
                    'schedules-view', 'schedules-create', 'schedules-edit', 'schedules-delete',
                    'leave-requests-view', 'leave-requests-create', 'leave-requests-edit', 'leave-requests-delete',
                    'leave-calendar-view', 'leave-balances-view',
                    'attendances-view', 'attendances-create', 'attendances-edit',
                    'attendance-disputes-view', 'attendance-disputes-edit',
                    'payrolls-view', 'payroll-deductions-view', 'reports-view',
                ],
            ],
        ];

        $typeIdsByCompanySlug = [];

        foreach ($companies as $companyId) {
            foreach ($defaults as $slug => $definition) {
                $typeId = DB::table('user_types')->insertGetId([
                    'company_id' => $companyId,
                    'name' => $definition['name'],
                    'slug' => $slug,
                    'access_scope' => $definition['access_scope'],
                    'is_system' => true,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);

                $typeIdsByCompanySlug[$companyId][$slug] = $typeId;

                $pivotRows = [];
                foreach ($definition['permissions'] as $permissionName) {
                    $permissionId = $permissionIdsByName[$permissionName] ?? null;
                    if ($permissionId === null) {
                        continue;
                    }

                    $pivotRows[] = [
                        'user_type_id' => $typeId,
                        'permission_id' => $permissionId,
                    ];
                }

                if ($pivotRows !== []) {
                    DB::table('user_type_permission')->insert($pivotRows);
                }
            }
        }

        $users = DB::table('users')
            ->select(['id', 'company_id', 'user_type'])
            ->whereNotNull('company_id')
            ->get();

        foreach ($users as $user) {
            $slug = $user->user_type ?: 'employee';
            $typeId = $typeIdsByCompanySlug[$user->company_id][$slug]
                ?? $typeIdsByCompanySlug[$user->company_id]['employee']
                ?? null;

            if ($typeId === null) {
                continue;
            }

            DB::table('users')->where('id', $user->id)->update([
                'user_type_id' => $typeId,
                'user_type' => $slug,
            ]);
        }
    }
};
