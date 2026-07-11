<?php

declare(strict_types=1);

namespace App\Http\Requests\ContractTemplate;

use App\Models\UserDetail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContractTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'employment_type' => [
                'required',
                'string',
                Rule::in(UserDetail::EMPLOYMENT_TYPES),
                Rule::unique('contract_templates', 'employment_type'),
            ],
            'body' => ['required', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
