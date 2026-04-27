<?php

namespace App\Http\Requests\Task;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id'        => ['required', 'exists:projects,id'],
            'status_id'         => ['required', 'exists:statuses,id'],
            'title'             => ['required', 'string', 'max:255'],
            'description'       => ['nullable', 'string'],
            'priority'          => ['required', 'in:low,medium,high,urgent'],
            'due_date'          => ['nullable', 'date'],
            'estimate_minutes'  => ['nullable', 'integer', 'min:0'],
            'parent_id'         => ['nullable', 'exists:tasks,id'],
            'assignees'         => ['nullable', 'array'],
            'assignees.*.id'    => ['exists:users,id'],
            'tagIds'            => ['nullable', 'array'],
            'tagIds.*'          => ['exists:tags,id'],
        ];
    }
}
