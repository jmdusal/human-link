<?php

namespace App\Http\Requests\LeavePolicy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeavePolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('leave_policies', 'name')],
            'default_credits' => ['required', 'numeric', 'min:0', 'max:999.99'],
            'is_active' => ['boolean'],
            'is_paid' => ['boolean'],
            'allow_carry_over' => ['boolean'],
            'max_carry_over' => ['required_if:allow_carry_over,true,1', 'numeric', 'min:0', 'max:999.99'],
        ];
    }
}
