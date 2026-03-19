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
        $policyId = $this->route('leave_policy')?->id ?? $this->route('leave_policy');

        return [
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('leave_policies', 'name')->ignore($policyId),
            ],
            'default_credits' => [
                'sometimes',
                'numeric',
                'min:0',
                'max:999.99'
            ],
            'is_active' => ['sometimes', 'boolean'],
            'is_paid' => ['sometimes', 'boolean'],
        ];
    }
}
