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
            'name'     => ['sometimes', 'string', 'max:255'],
            'email'    => ['sometimes', 'email', Rule::unique('users', 'email')->ignore($userId)],
            'password' => ['nullable', 'string', 'min:6'],
            'status'   => ['sometimes', Rule::in(['active', 'inactive'])],

            // user rates
            'monthly_rate'      => ['sometimes', 'numeric', 'min:0'],
            'daily_rate'        => ['sometimes', 'numeric', 'min:0'],
            'hourly_rate'       => ['sometimes', 'numeric', 'min:0'],
            'allowance_monthly' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'effective_date'    => ['sometimes', 'date'],
            'is_active'         => ['sometimes', 'boolean'],

            // schedules
            'weekly_data'           => ['sometimes', 'array', 'size:7'],
            'weekly_data.*.day_of_week'     => ['required_with:weekly_data', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start'   => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.shift_end'     => ['required_with:weekly_data', 'date_format:H:i'],
            'weekly_data.*.is_rest' => ['sometimes', 'boolean'],

            // 'weeklyData'                => ['sometimes', 'array', 'size:7'],
            // 'weeklyData.*.dayOfWeek'    => ['required_with:weeklyData', 'integer', 'between:0,6'],
            // 'weeklyData.*.shiftStart'   => ['required_with:weeklyData', 'date_format:H:i'],
            // 'weeklyData.*.shiftEnd'     => ['required_with:weeklyData', 'date_format:H:i'],
            // 'weeklyData.*.isRestDay'    => ['sometimes', 'boolean'],
            // 'weeklyData.*.isNightShift' => ['sometimes', 'boolean'],



            // 'schedules.*.id'          => ['sometimes', 'exists:schedules,id'],
            // 'schedules.*.day_of_week'    => ['required_with:schedules', 'integer', 'between:0,6'],
            // 'schedules.*.shift_start' => ['required_with:schedules', 'date_format:H:i'],
            // 'schedules.*.shift_end'   => ['required_with:schedules', 'date_format:H:i'],
            // 'schedules.*.is_rest_day' => ['sometimes', 'boolean'],
            // 'schedules.*.is_night_shift' => ['sometimes', 'boolean'],
        ];
    }
}
