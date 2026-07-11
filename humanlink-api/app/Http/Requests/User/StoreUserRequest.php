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
            'password' => ['required_without:send_invite', 'nullable', 'string', 'min:6'],
            'send_invite' => ['sometimes', 'boolean'],
            'status'   => ['required', Rule::in(['active', 'inactive'])],
            'role'     => ['nullable', 'string', 'exists:roles,name'],
            'user_type' => ['nullable', Rule::in(['employee', 'hr', 'manager'])],
            'hired_at' => ['nullable', 'date'],
            'sss_number' => ['nullable', 'string', 'max:50'],
            'philhealth_number' => ['nullable', 'string', 'max:50'],
            'pagibig_number' => ['nullable', 'string', 'max:50'],
            'tin' => ['nullable', 'string', 'max:50'],
            'job_title' => ['nullable', 'string', 'max:255'],
            'department' => ['nullable', 'string', 'max:255'],
            'employment_type' => ['nullable', Rule::in(['regular', 'probationary', 'contractor'])],
            'mobile' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'start_date' => ['nullable', 'date'],

            // Compensation is optional at create; payroll requires an active rate later.
            'monthly_rate'      => ['nullable', 'numeric', 'min:0', 'required_with:daily_rate,hourly_rate'],
            'daily_rate'        => ['nullable', 'numeric', 'min:0', 'required_with:monthly_rate,hourly_rate'],
            'hourly_rate'       => ['nullable', 'numeric', 'min:0', 'required_with:monthly_rate,daily_rate'],
            'allowance_monthly' => ['nullable', 'numeric', 'min:0'],
            'effective_date'    => ['nullable', 'date', 'required_with:monthly_rate'],
            'is_active'         => ['sometimes', 'boolean'],

            'weekly_data'                       => ['nullable', 'array', 'size:7'],
            'weekly_data.*.day_of_week'         => ['required_with:weekly_data', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start'         => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.shift_end'           => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.is_rest_day'         => ['sometimes', 'boolean'],
            'weekly_data.*.is_night_shift'      => ['sometimes', 'boolean'],
        ];
    }
}
