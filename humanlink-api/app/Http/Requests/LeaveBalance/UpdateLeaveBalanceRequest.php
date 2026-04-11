<?php

namespace App\Http\Requests\LeaveBalance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateLeaveBalanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return false;
    }

    public function rules(): array
    {
        return [
            'allowed' => ['sometimes', 'numeric', 'min:0', 'max:365'],
            'used' => ['sometimes', 'numeric', 'min:0', 'lte:allowed'],
        ];
    }
}
