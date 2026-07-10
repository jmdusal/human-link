<?php

declare(strict_types=1);

namespace App\Http\Requests\TaskAttachment;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:5120',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'Please select an image to upload.',
            'image.image' => 'Only image files are allowed.',
            'image.mimes' => 'Images must be jpeg, jpg, png, gif, or webp.',
            'image.max' => 'Images must be 5MB or smaller.',
        ];
    }
}
