<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Extract the enum value (UserRole enum returns value via ->value property)
        $userRoleValue = $user->role->value ?? $user->role;

        if (!in_array($userRoleValue, $roles)) {
            return response()->json([
                'message' => 'Unauthorized. Insufficient role.',
                'user_role' => $userRoleValue,
                'required_roles' => $roles,
            ], 403);
        }

        return $next($request);
    }
}
