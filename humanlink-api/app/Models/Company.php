<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $legal_name
 * @property string|null $address
 * @property string $timezone
 * @property string|null $mail_mailer
 * @property string|null $mail_host
 * @property int|null $mail_port
 * @property string|null $mail_username
 * @property string|null $mail_password
 * @property string|null $mail_encryption
 * @property string|null $mail_from_address
 * @property string|null $mail_from_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContractTemplate> $contractTemplates
 * @property-read int|null $contract_templates_count
 * @property-read bool $mail_password_set
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeavePolicy> $leavePolicies
 * @property-read int|null $leave_policies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayrollDeduction> $payrollDeductions
 * @property-read int|null $payroll_deductions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Workspace> $workspaces
 * @property-read int|null $workspaces_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereLegalName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailEncryption($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailFromAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailFromName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailHost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailMailer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailPort($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\IdCardTemplate> $idCardTemplates
 * @property-read int|null $id_card_templates_count
 * @mixin \Eloquent
 */
/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $legal_name
 * @property string|null $address
 * @property string $timezone
 * @property string|null $mail_mailer
 * @property string|null $mail_host
 * @property int|null $mail_port
 * @property string|null $mail_username
 * @property string|null $mail_password
 * @property string|null $mail_encryption
 * @property string|null $mail_from_address
 * @property string|null $mail_from_name
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ContractTemplate> $contractTemplates
 * @property-read int|null $contract_templates_count
 * @property-read bool $mail_password_set
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\LeavePolicy> $leavePolicies
 * @property-read int|null $leave_policies_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\PayrollDeduction> $payrollDeductions
 * @property-read int|null $payroll_deductions_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\User> $users
 * @property-read int|null $users_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Workspace> $workspaces
 * @property-read int|null $workspaces_count
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereLegalName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailEncryption($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailFromAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailFromName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailHost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailMailer($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailPassword($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailPort($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereMailUsername($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereTimezone($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Company whereUpdatedAt($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\IdCardTemplate> $idCardTemplates
 * @property-read int|null $id_card_templates_count
 * @mixin \Eloquent
 */
class Company extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'legal_name',
        'address',
        'timezone',
        'mail_mailer',
        'mail_host',
        'mail_port',
        'mail_username',
        'mail_password',
        'mail_encryption',
        'mail_from_address',
        'mail_from_name',
    ];

    protected $hidden = [
        'mail_password',
    ];

    protected $appends = [
        'mail_password_set',
    ];

    protected function casts(): array
    {
        return [
            'mail_port' => 'integer',
            'mail_password' => 'encrypted',
        ];
    }

    public function getMailPasswordSetAttribute(): bool
    {
        return filled($this->mail_password);
    }

    public function hasCustomMailTransport(): bool
    {
        $mailer = $this->mail_mailer;

        if (in_array($mailer, ['log', 'array'], true)) {
            return true;
        }

        if ($mailer === 'smtp' || $mailer === 'sendmail' || filled($mailer)) {
            return filled($this->mail_host) && filled($this->mail_from_address);
        }

        return false;
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function workspaces(): HasMany
    {
        return $this->hasMany(Workspace::class);
    }

    public function leavePolicies(): HasMany
    {
        return $this->hasMany(LeavePolicy::class);
    }

    public function contractTemplates(): HasMany
    {
        return $this->hasMany(ContractTemplate::class);
    }

    public function idCardTemplates(): HasMany
    {
        return $this->hasMany(IdCardTemplate::class);
    }

    public function payrollDeductions(): HasMany
    {
        return $this->hasMany(PayrollDeduction::class);
    }
}
