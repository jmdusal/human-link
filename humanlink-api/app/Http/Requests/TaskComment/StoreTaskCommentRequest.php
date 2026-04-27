<?php

namespace App\Http\Requests\TaskComment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreTaskCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content'   => 'required|string|max:5000',
            'parent_id' => 'nullable|exists:task_comments,id'
        ];
    }
}
