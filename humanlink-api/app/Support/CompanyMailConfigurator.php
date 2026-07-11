<?php

declare(strict_types=1);

namespace App\Support;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;

class CompanyMailConfigurator
{
    public function apply(?Company $company = null): void
    {
        $company ??= $this->resolveCompany();

        if (! $company) {
            return;
        }

        if (filled($company->mail_from_address)) {
            Config::set('mail.from.address', $company->mail_from_address);
            Config::set(
                'mail.from.name',
                $company->mail_from_name ?: $company->name
            );
        } elseif (filled($company->mail_from_name)) {
            Config::set('mail.from.name', $company->mail_from_name);
        }

        if (! $company->hasCustomMailTransport()) {
            return;
        }

        $mailerName = 'company_'.$company->id;
        $transport = $company->mail_mailer ?: 'smtp';

        if (in_array($transport, ['log', 'array'], true)) {
            Config::set("mail.mailers.{$mailerName}", [
                'transport' => $transport,
                'channel' => env('MAIL_LOG_CHANNEL'),
            ]);
            Config::set('mail.default', $mailerName);

            return;
        }

        Config::set("mail.mailers.{$mailerName}", [
            'transport' => $transport,
            'host' => $company->mail_host,
            'port' => $company->mail_port ?: 587,
            'encryption' => $company->mail_encryption ?: null,
            'username' => $company->mail_username,
            'password' => $company->mail_password,
            'timeout' => null,
            'path' => env('MAIL_SENDMAIL_PATH', '/usr/sbin/sendmail -bs -i'),
        ]);

        Config::set('mail.default', $mailerName);
    }

    public function applyForUser(?User $user): void
    {
        if (! $user?->company_id) {
            return;
        }

        $user->loadMissing('company');
        $this->apply($user->company);
    }

    private function resolveCompany(): ?Company
    {
        $user = Auth::user();

        if (! $user instanceof User || ! $user->company_id) {
            return null;
        }

        $user->loadMissing('company');

        return $user->company;
    }
}
