<?php

namespace App\Http\Requests\Status;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStatusRequest extends FormRequest
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
            'color_hex'     => ['required', 'string', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
            'position'      => ['required', 'integer', 'min:0',
                Rule::unique('statuses')->where(fn ($q) => $q->where('workspace_id', $this->workspace_id))
            ],
            // 'position'      => ['required', 'integer', 'min:0'],
        ];
    }
}
