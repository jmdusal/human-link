<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthorizePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();

        if (! $routeName) {
            return $next($request);
        }

        if ($request->user()?->hasRole('super-admin')) {
            return $next($request);
        }

        // Auth-only modules (no Spatie permission required).
        if (str_starts_with($routeName, 'me.') || str_starts_with($routeName, 'notifications.')) {
            return $next($request);
        }

        $permissionMap = [
            'index' => 'view',
            'show' => 'view',
            'status' => 'view',
            'managers' => 'view',
            'policyOptions' => 'view',
            'calendar' => 'view',
            'conflicts' => 'view',
            'pdf' => 'view',
            'store' => 'create',
            'start' => 'create',
            'generate' => 'create',
            'generateIndividual' => 'create',
            'generateThirteenthMonth' => 'create',
            'update' => 'edit',
            'patch' => 'edit',
            'pause' => 'edit',
            'resume' => 'edit',
            'end' => 'edit',
            'approve' => 'edit',
            'reject' => 'edit',
            'cancel' => 'edit',
            'destroy' => 'delete',
        ];

        $parts = explode('.', $routeName);

        if (count($parts) >= 2) {
            $module = $parts[0];
            $action = $parts[1];

            if (isset($permissionMap[$action])) {
                $permission = "{$module}-{$permissionMap[$action]}";

                if (! $request->user() || ! $request->user()->can($permission)) {
                    return response()->json([
                        'message' => "Forbidden: You need the '{$permission}' permission.",
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
