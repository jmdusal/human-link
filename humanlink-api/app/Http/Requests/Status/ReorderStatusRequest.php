<?php

namespace App\Http\Requests\Status;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ReorderStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'ids'   => ['required', 'array'],
            'ids.*' => ['required', 'integer', 'exists:statuses,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'ids.*.exists' => 'One or more selected statuses are invalid.',
        ];
    }
}
