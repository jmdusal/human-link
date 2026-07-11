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
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6'],
            'status'   => ['required', Rule::in(['active', 'inactive'])],
            'role'     => ['nullable', 'string', 'exists:roles,name'],
            'user_type' => ['nullable', Rule::in(['employee', 'hr', 'manager'])],
            'sss_number' => ['nullable', 'string', 'max:50'],
            'philhealth_number' => ['nullable', 'string', 'max:50'],
            'pagibig_number' => ['nullable', 'string', 'max:50'],
            'tin' => ['nullable', 'string', 'max:50'],
            'start_date' => ['nullable', 'date'],

            // rates
            'monthly_rate'      => ['required', 'numeric', 'min:0'],
            'daily_rate'        => ['required', 'numeric', 'min:0'],
            'hourly_rate'       => ['required', 'numeric', 'min:0'],
            'allowance_monthly' => ['nullable', 'numeric', 'min:0'],
            'effective_date'    => ['required', 'date'],
            'is_active'         => ['boolean'],

            'weekly_data'                       => ['required', 'array', 'size:7'],
            'weekly_data.*.day_of_week'         => ['required', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start'         => ['required', 'date_format:H:i'],
            'weekly_data.*.shift_end'           => ['required', 'date_format:H:i'],
            'weekly_data.*.is_rest_day'         => ['sometimes', 'boolean'],
            'weekly_data.*.is_night_shift'      => ['sometimes', 'boolean'],
        ];
    }
}
