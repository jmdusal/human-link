<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // return [
        //     'name'     => 'required|string|max:255',
        //     'email'    => 'required|email|unique:users,email',
        //     'password' => 'required|min:6',
        //     'status'   => 'required|in:active,inactive',
        //     'monthly_rate'      => 'required|numeric|min:0',
        //     'daily_rate'        => 'required|numeric|min:0',
        //     'hourly_rate'       => 'required|numeric|min:0',
        //     'allowance_monthly' => 'nullable|numeric|min:0',
        //     'effective_date'    => 'required|date',
        //     'is_active'         => 'boolean',
        // ];

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                Rule::unique('users', 'email')
            ],
            'password' => ['required', 'string', 'min:6'],
            'status' => [
                'required',
                Rule::in(['active', 'inactive'])
            ],
            'monthly_rate' => ['required', 'numeric', 'min:0'],
            'daily_rate' => ['required', 'numeric', 'min:0'],
            'hourly_rate' => ['required', 'numeric', 'min:0'],
            'allowance_monthly' => ['nullable', 'numeric', 'min:0'],
            'effective_date' => ['required', 'date'],
            'is_active' => ['boolean'],
        ];
    }
}
