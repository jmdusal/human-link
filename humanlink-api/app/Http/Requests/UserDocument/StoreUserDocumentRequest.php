<?php

declare(strict_types=1);

namespace App\Http\Requests\UserDocument;

use App\Models\UserDocument;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', Rule::in(UserDocument::TYPES)],
            'file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,gif,webp,pdf',
                'max:10240',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Please select a file to upload.',
            'file.mimes' => 'Documents must be jpeg, png, gif, webp, or pdf.',
            'file.max' => 'Documents must be 10MB or smaller.',
        ];
    }
}
