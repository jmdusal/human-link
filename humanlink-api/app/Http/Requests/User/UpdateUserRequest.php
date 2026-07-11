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

    protected function prepareForValidation(): void
    {
        if (! $this->has('weekly_data') || ! is_array($this->weekly_data)) {
            return;
        }

        $this->merge([
            'weekly_data' => collect($this->weekly_data)
                ->map(function (mixed $day): array {
                    $day = (array) $day;

                    foreach (['shift_start', 'shift_end'] as $key) {
                        if (! empty($day[$key]) && is_string($day[$key])) {
                            $day[$key] = substr($day[$key], 0, 5);
                        }
                    }

                    if (! array_key_exists('is_rest_day', $day) && array_key_exists('is_rest', $day)) {
                        $day['is_rest_day'] = $day['is_rest'];
                    }

                    if (! array_key_exists('is_night_shift', $day) && array_key_exists('is_night', $day)) {
                        $day['is_night_shift'] = $day['is_night'];
                    }

                    return $day;
                })
                ->values()
                ->all(),
        ]);
    }

    public function rules(): array
    {
        $userId = $this->route('user')?->id;

        return [
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:6'],
            'status'   => ['sometimes', Rule::in(['active', 'inactive'])],
            'role'     => ['sometimes', 'string', 'exists:roles,name'],
            'user_type' => ['sometimes', 'nullable', Rule::in(['employee', 'manager'])],
            'sss_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'philhealth_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'pagibig_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'tin' => ['sometimes', 'nullable', 'string', 'max:50'],
            'start_date' => ['sometimes', 'nullable', 'date'],

            'monthly_rate'      => ['sometimes', 'numeric', 'min:0'],
            'daily_rate'        => ['sometimes', 'numeric', 'min:0'],
            'hourly_rate'       => ['sometimes', 'numeric', 'min:0'],
            'allowance_monthly' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'effective_date'    => ['sometimes', 'date'],
            'is_active'         => ['sometimes', 'boolean'],

            'weekly_data'                       => ['sometimes', 'array', 'size:7'],
            'weekly_data.*.day_of_week'         => ['required_with:weekly_data', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start'         => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.shift_end'           => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.is_rest_day'         => ['sometimes', 'boolean'],
            'weekly_data.*.is_night_shift'      => ['sometimes', 'boolean'],
        ];
    }
}
