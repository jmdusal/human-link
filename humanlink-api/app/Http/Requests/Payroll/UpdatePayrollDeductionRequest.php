<?php

declare(strict_types=1);

namespace App\Http\Requests\Payroll;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePayrollDeductionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
            'type' => ['sometimes', Rule::in(['fixed', 'recurring'])],
            'is_active' => ['sometimes', 'boolean'],
            'start_month' => ['nullable', 'integer', 'between:1,12'],
            'start_year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
            'end_month' => ['nullable', 'integer', 'between:1,12'],
            'end_year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
        ];
    }
}
