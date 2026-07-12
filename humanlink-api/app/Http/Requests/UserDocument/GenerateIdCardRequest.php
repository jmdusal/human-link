<?php

declare(strict_types=1);

namespace App\Http\Requests\UserDocument;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class GenerateIdCardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'template_id' => ['sometimes', 'nullable', 'integer', Rule::exists('id_card_templates', 'id')],
        ];
    }
}
