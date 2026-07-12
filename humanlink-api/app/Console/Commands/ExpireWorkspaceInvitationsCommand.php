<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\WorkspaceMember;
use Illuminate\Console\Command;

class ExpireWorkspaceInvitationsCommand extends Command
{
    protected $signature = 'workspaces:expire-invitations';

    protected $description = 'Remove pending workspace invitations that have passed their TTL';

    public function handle(): int
    {
        $cutoff = now()->subDays(WorkspaceMember::INVITATION_TTL_DAYS);

        $expired = WorkspaceMember::query()
            ->where('status', WorkspaceMember::STATUS_PENDING)
            ->where(function ($query) use ($cutoff): void {
                $query->where('invited_at', '<=', $cutoff)
                    ->orWhere(function ($inner) use ($cutoff): void {
                        $inner->whereNull('invited_at')
                            ->where('created_at', '<=', $cutoff);
                    });
            })
            ->delete();

        $this->info("Expired {$expired} pending workspace invitation(s).");

        return self::SUCCESS;
    }
}
