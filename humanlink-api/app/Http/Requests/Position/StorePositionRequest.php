<?php

declare(strict_types=1);

namespace App\Http\Requests\Position;

use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = app(CompanyContext::class)->id();
        $departmentId = $this->input('department_id');

        return [
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('positions', 'name')->where(
                    fn ($query) => $query
                        ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                        ->where('department_id', $departmentId)
                ),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
