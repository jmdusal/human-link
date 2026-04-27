<?php

namespace App\Http\Requests\Project;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'workspace_id'  => ['required', 'exists:workspaces,id'],
            'name'          => ['required', 'string', 'max:255'],
            'description'   => ['nullable', 'string'],
            'status'        => ['required', 'in:active,completed,on-hold'],
            'start_date'    => ['nullable', 'date'],
            'end_date'      => ['nullable', 'date', 'after_or_equal:start_date'],
            // 'projectMembers' => ['required', 'array'],
            // 'projectMembers.*.id' => ['required', 'exists:users,id'],
            // 'projectMembers.*.role' => ['required', 'in:admin,member,viewer'],
            'project_members' => ['nullable', 'array'],
            'project_members.*.id' => ['required', 'exists:users,id'],
            'project_members.*.pivot.role' => ['nullable', 'string'],
            // 'project_members' => 'nullable|array',
            // 'project_members.*.id' => 'exists:users,id',
        ];
    }
}
