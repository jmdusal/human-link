<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'status' => [
                'required',
                Rule::in(['active', 'inactive'])
            ],
            'monthly_rate' => ['sometimes', 'numeric', 'min:0'],
            'daily_rate' => ['sometimes', 'numeric', 'min:0'],
            'hourly_rate' => ['sometimes', 'numeric', 'min:0'],
            'allowance_monthly' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'effective_date' => ['sometimes', 'date'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
