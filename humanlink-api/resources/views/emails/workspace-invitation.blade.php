@php
    $workspace->loadMissing('company:id,name');
    $companyName = $workspace->company?->name;
    $companyLabel = e($companyName ?: 'your company');
@endphp

@include('emails.branded-action', [
    'title' => 'Workspace invitation',
    'companyName' => $companyName,
    'userName' => $user->name,
    'body' => 'You\'ve been invited to join <strong style="color: #0f172a;">'.e($workspace->name).'</strong> at <strong style="color: #0f172a;">'.$companyLabel.'</strong>. Accept the invitation to become a member of this workspace.',
    'actionUrl' => $acceptUrl,
    'actionLabel' => 'Accept invitation',
    'footer' => 'This invitation was sent to '.e($user->email).'.<br>If you weren\'t expecting this, you can ignore this email.',
])
