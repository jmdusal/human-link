<?php

namespace App\Http\Requests\LeavePolicy;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeavePolicyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $leavePolicy = $this->route('leavePolicy')?->id ?? $this->route('leavePolicy');

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('leave_policies', 'name')->ignore($leavePolicy),],
            'default_credits' => ['sometimes', 'numeric', 'min:0', 'max:999.99'],
            'is_active' => ['sometimes', 'boolean'],
            'is_paid' => ['sometimes', 'boolean'],
        ];
    }
}
