@php
    $workspace->loadMissing('company:id,name');
    $companyName = $workspace->company?->name;
@endphp

@include('emails.branded-action', [
    'title' => 'You\'re in',
    'companyName' => $companyName,
    'userName' => $user->name,
    'body' => 'Your invitation was accepted. You are now a confirmed member of <strong style="color: #0f172a;">'.e($workspace->name).'</strong>'.($companyName ? ' at <strong style="color: #0f172a;">'.e($companyName).'</strong>' : '').' and can start collaborating with the team.',
    'actionUrl' => $workspaceUrl,
    'actionLabel' => 'Open workspace',
    'footer' => 'Confirmation sent to '.e($user->email).'.',
])
