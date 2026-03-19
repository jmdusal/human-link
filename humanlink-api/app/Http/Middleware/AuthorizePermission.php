<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Str;
use Symfony\Component\HttpFoundation\Response;


class AuthorizePermission
{
    public function handle(Request $request, Closure $next): Response
    {
        $routeName = $request->route()->getName();

        if (!$routeName) {
            return $next($request);
        }

        $permissionMap = [
            'index'   => 'view',
            'show'    => 'view',
            'store'   => 'create',
            'update'  => 'edit',
            'destroy' => 'delete',
        ];

        $parts = explode('.', $routeName);

        if (count($parts) === 2) {
            $module = Str::singular($parts[0]);
            $action = $parts[1];

            if (isset($permissionMap[$action])) {
                $permission = $module . '-' . $permissionMap[$action];

                if (!$request->user() || !$request->user()->can($permission)) {
                    return response()->json([
                        'message' => "You need the '{$permission}' permission."
                    ], 403);
                }
            }
        }

        return $next($request);
    }
}
