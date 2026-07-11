<?php

declare(strict_types=1);

namespace App\Http\Requests\EmployeeLifecycle;

use Illuminate\Foundation\Http\FormRequest;

class OffboardUserRequest extends FormRequest
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
            'terminated_at' => ['required', 'date'],
            'generate_final_payslip' => ['sometimes', 'boolean'],
            'include_leave_payout' => ['sometimes', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
