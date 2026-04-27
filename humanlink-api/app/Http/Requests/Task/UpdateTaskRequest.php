<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status_id'         => ['sometimes', 'exists:statuses,id'],
            'title'             => ['sometimes', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'priority'          => ['sometimes', 'in:low,medium,high,urgent'],
            'position'          => ['sometimes', 'numeric'],
            'due_date'          => ['nullable', 'date'],
            'estimate_minutes'  => ['nullable', 'integer', 'min:0'],
            'assignees'         => ['nullable', 'array'],
            'assignees.*.id'    => ['exists:users,id'],
            'tag_ids'           => ['nullable', 'array'],
            'tag_ids.*'         => ['exists:tags,id'],
        ];
    }
}
