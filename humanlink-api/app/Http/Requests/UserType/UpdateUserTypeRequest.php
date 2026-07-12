<?php

declare(strict_types=1);

namespace App\Http\Requests\UserType;

use App\Enums\AccessScope;
use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserTypeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $companyId = app(CompanyContext::class)->id();
        $userTypeId = $this->route('user_type')?->id ?? $this->route('userType')?->id;

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('user_types', 'name')
                    ->where(fn ($query) => $query->where('company_id', $companyId))
                    ->ignore($userTypeId),
            ],
            'slug' => [
                'sometimes',
                'nullable',
                'string',
                'max:64',
                Rule::unique('user_types', 'slug')
                    ->where(fn ($query) => $query->where('company_id', $companyId))
                    ->ignore($userTypeId),
            ],
            'access_scope' => ['sometimes', 'required', Rule::in(AccessScope::values())],
            'permissions' => ['sometimes', 'nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }
}
