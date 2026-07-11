<?php

declare(strict_types=1);

namespace App\Http\Requests\LeaveRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'integer', 'exists:users,id'],
            'leave_policy_id' => ['required', 'integer', 'exists:leave_policies,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'half_day_type' => ['nullable', Rule::in(['none', 'morning', 'afternoon'])],
            'reason' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
