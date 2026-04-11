<?php

namespace App\Http\Requests\LeaveBalance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeaveBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'exists:users,id'],
            'year' => ['required', 'integer', 'min:2024', 'max:2100'],
            'allowed' => ['required', 'numeric', 'min:0', 'max:365'],
            'used' => ['nullable', 'numeric', 'min:0', 'lte:allowed'],
            'leave_policy_id' => ['required', 'exists:leave_policies,id', Rule::unique('leave_balances')->where(fn($q) => $q->where('user_id', $this->user_id)->where('year', $this->year))],
        ];
    }
}
