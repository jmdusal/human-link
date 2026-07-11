@include('emails.branded-action', [
    'title' => 'Workspace invitation',
    'userName' => $user->name,
    'body' => 'You\'ve been invited to join <strong style="color: #0f172a;">'.e($workspace->name).'</strong> on HumanLink. Accept the invitation to become a member of this workspace.',
    'actionUrl' => $acceptUrl,
    'actionLabel' => 'Accept invitation',
    'footer' => 'This invitation was sent to '.e($user->email).'.<br>If you weren\'t expecting this, you can ignore this email.',
])
