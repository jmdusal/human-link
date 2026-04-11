<?php

namespace App\Http\Requests\Workspace;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateWorkspaceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('workspaces', 'name')->ignore($this->workspace)],
            'slug' => ['sometimes', 'string', Rule::unique('workspaces', 'slug')->ignore($this->workspace)],
            'members' => ['sometimes', 'array'],
            'members.*.id' => ['required', 'exists:users,id'],
            'owner_id' => ['sometimes', 'exists:users,id'],
        ];
    }
}
