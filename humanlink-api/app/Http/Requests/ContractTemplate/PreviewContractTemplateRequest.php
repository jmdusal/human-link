<?php

declare(strict_types=1);

namespace App\Http\Requests\ContractTemplate;

use Illuminate\Foundation\Http\FormRequest;

class PreviewContractTemplateRequest extends FormRequest
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
