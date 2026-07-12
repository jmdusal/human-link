<?php

declare(strict_types=1);

namespace App\Http\Requests\Position;

use App\Support\CompanyContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $position = $this->route('position');
        $positionId = $position?->id ?? $position;
        $companyId = app(CompanyContext::class)->id();
        $departmentId = $this->input('department_id', $position?->department_id);

        return [
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'name' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('positions', 'name')
                    ->ignore($positionId)
                    ->where(
                        fn ($query) => $query
                            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
                            ->where('department_id', $departmentId)
                    ),
            ],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
