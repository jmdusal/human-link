<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AuthorizePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()?->getName();

        if (!$routeName) {
            return $next($request);
        }

        if ($request->user()?->hasRole('super-admin')) {
            return $next($request);
        }

        $permissionMap = [
            'index'   => 'view',
            'show'    => 'view',
            'store'   => 'create',
            'update'  => 'edit',
            'patch'   => 'edit',
            'destroy' => 'delete',
        ];

        $parts = explode('.', $routeName);

        if (count($parts) >= 2) {
            $module = $parts[0];
            $action = $parts[1];

            if (isset($permissionMap[$action])) {
                $permission = "{$module}-{$permissionMap[$action]}";

                if (!$request->user() || !$request->user()->can($permission)) {

                    // Log::warning("Unauthorized Access Attempt", [
                    //     'user_id' => $request->user()?->id,
                    //     'route' => $routeName,
                    //     'required_permission' => $permission
                    // ]);

                    return response()->json([
                        'message' => "Forbidden: You need the '{$permission}' permission."
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
