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
        return [
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6'],
            'status'   => ['required', Rule::in(['active', 'inactive'])],

            // rates
            'monthly_rate'      => ['required', 'numeric', 'min:0'],
            'daily_rate'        => ['required', 'numeric', 'min:0'],
            'hourly_rate'       => ['required', 'numeric', 'min:0'],
            'allowance_monthly' => ['nullable', 'numeric', 'min:0'],
            'effective_date'    => ['required', 'date'],
            'is_active'         => ['boolean'],

            // schedules
            // 'startDate'                 => ['required', 'date'],
            // 'endDate'                   => ['nullable', 'date'],
            // 'weeklyData'                => ['required', 'array', 'size:7'],
            // 'weeklyData.*.dayOfWeek'    => ['required', 'integer', 'between:0,6'],
            // 'weeklyData.*.shiftStart'   => ['required', 'date_format:H:i'],
            // 'weeklyData.*.shiftEnd'     => ['required', 'date_format:H:i'],
            // 'weeklyData.*.breakMinutes' => ['nullable', 'integer', 'min:0'],
            // 'weeklyData.*.isRestDay'    => ['boolean'],
            // 'weeklyData.*.isNightShift' => ['boolean'],
            'weekly_data'           => ['required', 'array', 'size:7'],
            'weekly_data.*.day_of_week'     => ['required', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start'   => ['required', 'date_format:H:i'],
            'weekly_data.*.shift_end'     => ['required', 'date_format:H:i'],
            'weekly_data.*.break'   => ['nullable', 'integer', 'min:0'],
            'weekly_data.*.is_rest' => ['boolean'],
            'weekly_data.*.is_night'=> ['boolean'],

            // 'schedules'                 => ['required', 'array', 'min:1'],
            // 'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            // 'schedules.*.start_date'    => ['required_with:schedules', 'date'],
            // 'schedules.*.end_date'      => ['nullable', 'date'],
            // 'schedules.*.shift_start'   => ['required', 'date_format:H:i'],
            // 'schedules.*.shift_end'     => ['required', 'date_format:H:i'],
            // 'schedules.*.break_minutes' => ['nullable', 'integer', 'min:0'],
            // 'schedules.*.is_rest_day'   => ['boolean'],
            // 'schedules.*.is_night_shift'=> ['boolean'],
        ];
    }
}
