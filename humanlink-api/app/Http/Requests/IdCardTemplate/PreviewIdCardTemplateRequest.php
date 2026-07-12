<?php

declare(strict_types=1);

namespace App\Http\Requests\IdCardTemplate;

use Illuminate\Foundation\Http\FormRequest;

class PreviewIdCardTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string'],
        ];
    }
}
