<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $file_path
 * @property string $file_name
 * @property string $file_type
 * @property int $file_size
 * @property int|null $uploaded_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $type_label
 * @property-read \App\Models\User|null $uploader
 * @property-read string $url
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUploadedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUserId($value)
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property int $user_id
 * @property string $type
 * @property string $file_path
 * @property string $file_name
 * @property string $file_type
 * @property int $file_size
 * @property int|null $uploaded_by
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read string $type_label
 * @property-read \App\Models\User|null $uploader
 * @property-read string $url
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFilePath($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileSize($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereFileType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUploadedBy($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|UserDocument whereUserId($value)
 * @mixin \Eloquent
 */
class UserDocument extends Model
{
    public const TYPE_CONTRACT = 'contract';

    public const TYPE_ID_SCAN = 'id_scan';

    public const TYPE_SIGNED_POLICY = 'signed_policy';

    public const TYPES = [
        self::TYPE_CONTRACT,
        self::TYPE_ID_SCAN,
        self::TYPE_SIGNED_POLICY,
    ];

    public const TYPE_LABELS = [
        self::TYPE_CONTRACT => 'Contract',
        self::TYPE_ID_SCAN => 'Employee ID',
        self::TYPE_SIGNED_POLICY => 'Signed policy',
    ];

    /** Soft checklist keys auto-marked when a file of this type is uploaded. */
    public const TYPE_CHECKLIST_KEYS = [
        self::TYPE_CONTRACT => 'upload_contract',
        self::TYPE_ID_SCAN => 'upload_id_scan',
        self::TYPE_SIGNED_POLICY => 'sign_policies',
    ];

    protected $fillable = [
        'user_id',
        'type',
        'file_path',
        'file_name',
        'file_type',
        'file_size',
        'uploaded_by',
    ];

    protected $appends = [
        'url',
        'type_label',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    protected function url(): Attribute
    {
        return Attribute::get(
            fn (): string => '/storage/'.ltrim($this->file_path, '/')
        );
    }

    protected function typeLabel(): Attribute
    {
        return Attribute::get(
            fn (): string => self::TYPE_LABELS[$this->type] ?? $this->type
        );
    }
}
