<?php

declare(strict_types=1);

namespace App\Http\Requests\Department;

use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = app(CompanyContext::class)->id();

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments', 'name')->where(
                    fn ($query) => $companyId ? $query->where('company_id', $companyId) : $query
                ),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
