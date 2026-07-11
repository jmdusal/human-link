<?php

declare(strict_types=1);

namespace App\Http\Requests\Schedule;

use Illuminate\Foundation\Http\FormRequest;

class StoreScheduleRequest extends FormRequest
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

                    return [
                        'day_of_week' => (int) ($day['day_of_week'] ?? $day['dayOfWeek'] ?? 0),
                        'shift_start' => substr((string) ($day['shift_start'] ?? $day['shiftStart'] ?? '08:00'), 0, 5),
                        'shift_end' => substr((string) ($day['shift_end'] ?? $day['shiftEnd'] ?? '17:00'), 0, 5),
                        'is_rest_day' => (bool) ($day['is_rest_day'] ?? $day['isRestDay'] ?? false),
                        'is_night_shift' => (bool) ($day['is_night_shift'] ?? $day['isNightShift'] ?? false),
                    ];
                })
                ->values()
                ->all(),
        ]);
    }

    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            'break_minutes' => ['sometimes', 'integer', 'min:0', 'max:240'],
            'weekly_data' => ['required', 'array', 'size:7'],
            'weekly_data.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'weekly_data.*.shift_start' => ['required', 'date_format:H:i'],
            'weekly_data.*.shift_end' => ['required', 'date_format:H:i'],
            'weekly_data.*.is_rest_day' => ['sometimes', 'boolean'],
            'weekly_data.*.is_night_shift' => ['sometimes', 'boolean'],
        ];
    }
}
