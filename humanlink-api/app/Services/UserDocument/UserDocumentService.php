<?php

declare(strict_types=1);

namespace App\Services\UserDocument;

use App\Contracts\EmployeeLifecycleServiceInterface;
use App\Contracts\UserDocumentServiceInterface;
use App\Models\ContractTemplate;
use App\Models\IdCardTemplate;
use App\Models\User;
use App\Models\UserDocument;
use App\Support\HtmlToPng;
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

        if ($user->documents()->where('type', UserDocument::TYPE_CONTRACT)->exists()) {
            throw ValidationException::withMessages([
                'contract' => ['A contract already exists. Delete it first before generating a new one.'],
            ]);
        }

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
            ->where('company_id', $user->company_id)
            ->where('employment_type', $employmentType)
            ->where('is_active', true)
            ->exists();

        if (! $hasActiveTemplate) {
            return null;
        }

        // Only one contract is allowed; never auto-replace.
        if ($user->documents()->where('type', UserDocument::TYPE_CONTRACT)->exists()) {
            return null;
        }

        try {
            return $this->generateContract($user);
        } catch (ValidationException) {
            return null;
        }
    }

    public function generateIdCard(User $user, ?int $templateId = null): UserDocument
    {
        $user->loadMissing(['details', 'rate']);

        if ($user->documents()->where('type', UserDocument::TYPE_ID_SCAN)->exists()) {
            throw ValidationException::withMessages([
                'id_scan' => ['An employee ID already exists. Delete it first before generating a new one.'],
            ]);
        }

        $template = $this->resolveIdCardTemplate($user, $templateId);
        $filledBody = $this->fillPlaceholders($template->body, $user);

        $pdf = Pdf::loadView('id-cards.pdf', ['body' => $filledBody])
            ->setPaper([0, 0, 460, 290]);
        $pngBinary = HtmlToPng::trimWhitespace(
            HtmlToPng::fromPdfBinary($pdf->output())
        );

        $fileName = sprintf(
            'id-card-%s-%s.png',
            str($user->name)->slug()->toString() ?: 'employee',
            now()->format('Ymd-His')
        );
        $relativePath = 'user-documents/'.Str::uuid()->toString().'.png';

        return DB::transaction(function () use ($user, $pngBinary, $relativePath, $fileName): UserDocument {
            Storage::disk('public')->put($relativePath, $pngBinary);

            $document = $user->documents()->create([
                'type' => UserDocument::TYPE_ID_SCAN,
                'file_path' => $relativePath,
                'file_name' => $fileName,
                'file_type' => 'image/png',
                'file_size' => strlen($pngBinary),
                'uploaded_by' => Auth::id(),
            ])->load('uploader:id,name');

            $this->markChecklistDoneForType($user, UserDocument::TYPE_ID_SCAN);

            return $document;
        });
    }

    public function syncIdCard(User $user, bool $force = false): ?UserDocument
    {
        $user->loadMissing(['details', 'rate']);

        $hasActiveTemplate = IdCardTemplate::query()
            ->where('company_id', $user->company_id)
            ->where('is_active', true)
            ->exists();

        if (! $hasActiveTemplate) {
            return null;
        }

        // Only one employee ID is allowed; never auto-replace.
        if ($user->documents()->where('type', UserDocument::TYPE_ID_SCAN)->exists()) {
            return null;
        }

        try {
            return $this->generateIdCard($user);
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

    private function resolveIdCardTemplate(User $user, ?int $templateId): IdCardTemplate
    {
        if ($templateId !== null) {
            $template = IdCardTemplate::query()
                ->whereKey($templateId)
                ->where('company_id', $user->company_id)
                ->where('is_active', true)
                ->first();

            if (! $template) {
                throw ValidationException::withMessages([
                    'template_id' => ['The selected ID card template was not found or is inactive.'],
                ]);
            }

            return $template;
        }

        $template = IdCardTemplate::query()
            ->where('company_id', $user->company_id)
            ->where('is_active', true)
            ->first();

        if (! $template) {
            throw ValidationException::withMessages([
                'template_id' => ['No active ID card template found for this company.'],
            ]);
        }

        return $template;
    }

    private function resolveTemplate(User $user, ?int $templateId): ContractTemplate
    {
        if ($templateId !== null) {
            $template = ContractTemplate::query()
                ->whereKey($templateId)
                ->where('company_id', $user->company_id)
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
            ->where('company_id', $user->company_id)
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
            '{{company_name}}' => e($this->resolveCompanyDisplayName($user)),
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
            '{{initials}}' => e($this->resolveInitials($user->name ?? '')),
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $body);
    }

    private function resolveCompanyDisplayName(User $user): string
    {
        $user->loadMissing('company');
        $company = $user->company;

        if (! $company) {
            return '—';
        }

        $name = trim((string) ($company->name ?? ''));
        if ($name !== '') {
            return $name;
        }

        $legalName = trim((string) ($company->legal_name ?? ''));

        return $legalName !== '' ? $legalName : '—';
    }

    private function formatMoney(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        return number_format((float) $value, 2, '.', ',');
    }

    private function resolveInitials(string $name): string
    {
        $name = trim($name);

        if ($name === '') {
            return '?';
        }

        $parts = preg_split('/\s+/', $name) ?: [];

        if (count($parts) > 1) {
            return strtoupper(mb_substr($parts[0], 0, 1).mb_substr($parts[1], 0, 1));
        }

        return strtoupper(mb_substr($parts[0], 0, 2));
    }

    private function markChecklistDoneForType(User $user, string $type): void
    {
        $checklistKey = UserDocument::TYPE_CHECKLIST_KEYS[$type] ?? null;

        if ($checklistKey) {
            $this->lifecycleService->markOnboardItemDone($user, $checklistKey);
        }
    }
}
