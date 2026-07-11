<?php

declare(strict_types=1);

namespace App\Contracts;

use App\Models\User;
use App\Models\UserDocument;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface UserDocumentServiceInterface
{
    public function list(User $user): Collection;

    public function create(User $user, string $type, UploadedFile $file): UserDocument;

    public function generateContract(User $user, ?int $templateId = null): UserDocument;

    public function syncContractForEmploymentType(User $user, bool $force = false): ?UserDocument;

    public function delete(UserDocument $document): void;
}
