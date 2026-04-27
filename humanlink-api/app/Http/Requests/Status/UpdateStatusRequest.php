<?php

namespace App\Http\Requests\Status;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['sometimes', 'string', 'max:255'],
            'color_hex' => ['sometimes', 'string', 'regex:/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/'],
            'position'  => ['sometimes', 'integer', 'min:0',
                Rule::unique('statuses')
                    ->where('workspace_id', $this->status->workspace_id)
                    ->ignore($this->status->id)
            ],
            // 'position'  => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
