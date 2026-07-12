<?php

declare(strict_types=1);

namespace App\Http\Requests\IdCardTemplate;

use Illuminate\Foundation\Http\FormRequest;

class UpdateIdCardTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
