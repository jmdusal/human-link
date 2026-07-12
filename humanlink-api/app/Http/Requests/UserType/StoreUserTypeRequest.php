<?php

declare(strict_types=1);

namespace App\Http\Requests\UserType;

use App\Enums\AccessScope;
use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = app(CompanyContext::class)->id();

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('user_types', 'name')->where(
                    fn ($query) => $query->where('company_id', $companyId)
                ),
            ],
            'slug' => [
                'nullable',
                'string',
                'max:64',
                Rule::unique('user_types', 'slug')->where(
                    fn ($query) => $query->where('company_id', $companyId)
                ),
            ],
            'access_scope' => ['required', Rule::in(AccessScope::values())],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
