<?php

declare(strict_types=1);

namespace App\Http\Requests\ContractTemplate;

use App\Models\UserDetail;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContractTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $contractTemplate = $this->route('contractTemplate');
        $ignoreId = is_object($contractTemplate) ? $contractTemplate->id : $contractTemplate;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'employment_type' => [
                'sometimes',
                'string',
                Rule::in(UserDetail::EMPLOYMENT_TYPES),
                Rule::unique('contract_templates', 'employment_type')->ignore($ignoreId),
            ],
            'body' => ['sometimes', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
