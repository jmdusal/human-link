<?php

declare(strict_types=1);

namespace App\Http\Requests\LeaveRequest;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'leave_policy_id' => ['sometimes', 'integer', 'exists:leave_policies,id'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after_or_equal:start_date'],
            'half_day_type' => ['sometimes', Rule::in(['none', 'morning', 'afternoon'])],
            'reason' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}
