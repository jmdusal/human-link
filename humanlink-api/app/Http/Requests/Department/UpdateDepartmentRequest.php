<?php

declare(strict_types=1);

namespace App\Http\Requests\Department;

use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $department = $this->route('department');
        $departmentId = $department?->id ?? $department;
        $companyId = app(CompanyContext::class)->id();

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('departments', 'name')
                    ->ignore($departmentId)
                    ->where(fn ($query) => $companyId ? $query->where('company_id', $companyId) : $query),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
