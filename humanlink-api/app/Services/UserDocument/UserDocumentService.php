<?php

declare(strict_types=1);

namespace App\Services\UserDocument;

use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\UserDocumentServiceInterface;
use App\Models\ContractTemplate;
use App\Models\User;
use App\Models\UserDocument;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserDocumentService implements UserDocumentServiceInterface
{
    public function __construct(
        private EmployeeLifecycleServiceInterface $lifecycleService
    ) {}

    public function list(User $user): Collection
    {
        return $user->documents()->with('uploader:id,name')->get();
    }

    public function create(User $user, string $type, UploadedFile $file): UserDocument
    {
        if (! in_array($type, UserDocument::TYPES, true)) {
            throw ValidationException::withMessages([
                'type' => ['Invalid document type.'],
            ]);
        }

        return DB::transaction(function () use ($user, $type, $file): UserDocument {
            $extension = $file->getClientOriginalExtension()
                ?: $file->extension()
                ?: 'bin';
            $storedName = Str::uuid()->toString().'.'.strtolower($extension);
            $path = $file->storeAs('user-documents', $storedName, 'public');

            $document = $user->documents()->create([
                'type' => $type,
                'file_path' => $path,
                'file_name' => $file->getClientOriginalName(),
                'file_type' => $file->getMimeType() ?? 'application/octet-stream',
                'file_size' => $file->getSize(),
                'uploaded_by' => Auth::id(),
            ])->load('uploader:id,name');

            $this->markChecklistDoneForType($user, $type);

            return $document;
        });
    }

    public function generateContract(User $user, ?int $templateId = null): UserDocument
    {
        $user->loadMissing(['details', 'rate']);

        $template = $this->resolveTemplate($user, $templateId);
        $filledBody = $this->fillPlaceholders($template->body, $user);

        $pdf = Pdf::loadView('contracts.pdf', ['body' => $filledBody]);
        $binary = $pdf->output();

        $fileName = sprintf(
            'contract-%s-%s.pdf',
            str($user->name)->slug()->toString() ?: 'employee',
            now()->format('Ymd-His')
        );
        $relativePath = 'user-documents/'.Str::uuid()->toString().'.pdf';

        return DB::transaction(function () use ($user, $binary, $relativePath, $fileName): UserDocument {
            Storage::disk('public')->put($relativePath, $binary);

            $document = $user->documents()->create([
                'type' => UserDocument::TYPE_CONTRACT,
                'file_path' => $relativePath,
                'file_name' => $fileName,
                'file_type' => 'application/pdf',
                'file_size' => strlen($binary),
                'uploaded_by' => Auth::id(),
            ])->load('uploader:id,name');

            $this->markChecklistDoneForType($user, UserDocument::TYPE_CONTRACT);

            return $document;
        });
    }

    public function syncContractForEmploymentType(User $user, bool $force = false): ?UserDocument
    {
        $user->loadMissing(['details', 'rate']);

        $employmentType = $user->details?->employment_type;

        if (! filled($employmentType)) {
            return null;
        }

        $hasActiveTemplate = ContractTemplate::query()
            ->where('employment_type', $employmentType)
            ->where('is_active', true)
            ->exists();

        if (! $hasActiveTemplate) {
            return null;
        }

        if (! $force && $user->documents()->where('type', UserDocument::TYPE_CONTRACT)->exists()) {
            return null;
        }

        try {
            return $this->generateContract($user);
        } catch (ValidationException) {
            return null;
        }
    }

    public function delete(UserDocument $document): void
    {
        DB::transaction(function () use ($document): void {
            Storage::disk('public')->delete($document->file_path);
            $document->delete();
        });
    }

    private function resolveTemplate(User $user, ?int $templateId): ContractTemplate
    {
        if ($templateId !== null) {
            $template = ContractTemplate::query()
                ->whereKey($templateId)
                ->where('is_active', true)
                ->first();

            if (! $template) {
                throw ValidationException::withMessages([
                    'template_id' => ['The selected contract template was not found or is inactive.'],
                ]);
            }

            return $template;
        }

        $employmentType = $user->details?->employment_type;

        if (! $employmentType) {
            throw ValidationException::withMessages([
                'employment_type' => ['Set the employee employment type before generating a contract.'],
            ]);
        }

        $template = ContractTemplate::query()
            ->where('employment_type', $employmentType)
            ->where('is_active', true)
            ->first();

        if (! $template) {
            throw ValidationException::withMessages([
                'template_id' => ["No active contract template found for employment type \"{$employmentType}\"."],
            ]);
        }

        return $template;
    }

    private function fillPlaceholders(string $body, User $user): string
    {
        $details = $user->details;
        $rate = $user->rate;

        $employmentType = $details?->employment_type;
        $employmentTypeLabel = $employmentType
            ? str($employmentType)->replace('_', ' ')->title()->toString()
            : '';

        $hiredAt = $user->hired_at
            ? $user->hired_at->format('F j, Y')
            : '';

        $replacements = [
            '{{employee_name}}' => e($user->name ?? ''),
            '{{email}}' => e($user->email ?? ''),
            '{{job_title}}' => e($details?->job_title ?? '—'),
            '{{department}}' => e($details?->department ?? '—'),
            '{{employment_type}}' => e($employmentTypeLabel !== '' ? $employmentTypeLabel : '—'),
            '{{hired_at}}' => e($hiredAt !== '' ? $hiredAt : '—'),
            '{{monthly_rate}}' => e($this->formatMoney($rate?->monthly_rate)),
            '{{daily_rate}}' => e($this->formatMoney($rate?->daily_rate)),
            '{{hourly_rate}}' => e($this->formatMoney($rate?->hourly_rate)),
            '{{generated_at}}' => e(now()->format('F j, Y')),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $body);
    }

    private function formatMoney(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        return number_format((float) $value, 2, '.', ',');
    }

    private function markChecklistDoneForType(User $user, string $type): void
    {
        $checklistKey = UserDocument::TYPE_CHECKLIST_KEYS[$type] ?? null;

        if ($checklistKey) {
            $this->lifecycleService->markOnboardItemDone($user, $checklistKey);
        }
    }
}
