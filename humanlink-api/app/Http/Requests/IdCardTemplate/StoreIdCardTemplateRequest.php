<?php

declare(strict_types=1);

namespace App\Http\Requests\IdCardTemplate;

use App\Models\IdCardTemplate;
use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreIdCardTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $companyId = app(CompanyContext::class)->id();

            if ($companyId === null) {
                return;
            }

            $exists = IdCardTemplate::query()
                ->where('company_id', $companyId)
                ->exists();

            if ($exists) {
                $validator->errors()->add(
                    'company_id',
                    'An ID card template already exists for this company. Edit the existing template instead.'
                );
            }
        });
    }
}
