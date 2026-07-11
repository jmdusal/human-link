<?php

declare(strict_types=1);

namespace App\Http\Requests\AttendanceDispute;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attendance_id' => ['required', 'integer', 'exists:attendances,id'],
            'reason' => ['required', 'string', 'max:2000'],
            'proposed_total_ms' => ['nullable', 'integer', 'min:0'],
            'proposed_overtime_ms' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
