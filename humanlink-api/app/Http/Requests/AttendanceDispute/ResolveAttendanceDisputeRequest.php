<?php

declare(strict_types=1);

namespace App\Http\Requests\AttendanceDispute;

use Illuminate\Foundation\Http\FormRequest;

class ResolveAttendanceDisputeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resolution_note' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
