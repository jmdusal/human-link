<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\EmployeeChecklistItem;
use App\Models\User;

interface EmployeeLifecycleServiceInterface
{
    /**
     * @return array{
     *     onboard: \App\Models\EmployeeChecklist,
     *     offboard: \App\Models\EmployeeChecklist|null,
     *     documents: \Illuminate\Database\Eloquent\Collection,
     *     soft_document_keys: list<string>
     * }
     */
    public function getLifecycle(User $user): array;

    public function ensureOnboardChecklist(User $user): \App\Models\EmployeeChecklist;

    public function toggleItem(User $user, EmployeeChecklistItem $item): EmployeeChecklistItem;

    public function markOnboardItemDone(User $user, string $key): void;

    /**
     * @return array{user: User, checklist: \App\Models\EmployeeChecklist, payslip: \App\Models\Payslip|null}
     */
    public function offboard(User $user, array $data): array;
}
