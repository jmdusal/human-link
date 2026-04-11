<?php

namespace App\Mail;

use App\Models\Workspace;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WorkspaceInvitation extends Mailable
{
    use Queueable, SerializesModels;

    // Add these public properties
    public function __construct(
        public Workspace $workspace,
        public User $user
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You've been invited to {$this->workspace->name}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.workspace-invitation',
        );
    }

    // public function content(): Content
    // {
    //     $wsName = escapeshellarg($this->workspace->name);
    //     $uName = escapeshellarg($this->user->name);
    //     $url = escapeshellarg(config('app.frontend_url') ?? 'http://localhost:5173');

    //     // Note: 'human_link_ui' must be reachable from the 'api' container
    //     $command = "docker exec human_link_ui npx tsx scripts/render-email.ts $wsName $uName $url 2>&1";

    //     $html = shell_exec($command);

    //     if (empty($html) || str_contains($html, 'Error')) {
    //         return new Content(view: 'emails.workspace-invitation');
    //     }

    //     return new Content(
    //         htmlString: $html,
    //     );
    // }

    // public function content(): Content
    // {
    //     $wsName = escapeshellarg($this->workspace->name);
    //     $uName = escapeshellarg($this->user->name);
    //     $url = escapeshellarg(config('app.frontend_url'));

    //     // NO MORE "docker exec" - just run npx tsx directly inside this container!
    //     // $command = "npx tsx scripts/render-email.ts $wsName $uName $url 2>&1";
    //     $command = "/usr/local/bin/tsx scripts/render-email.ts $wsName $uName $url 2>&1";

    //     $htmlContent = shell_exec($command);

    //     // Safety fallback
    //     if (empty($htmlContent) || str_contains($htmlContent, 'Error')) {
    //         return new Content(view: 'emails.workspace-invitation');
    //     }

    //     return new Content(
    //         htmlString: $htmlContent,
    //     );
    // }
}
