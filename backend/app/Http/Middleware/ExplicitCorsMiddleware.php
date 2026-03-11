<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ExplicitCorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $origin = $request->header('Origin');

        Log::debug('[CORS] Request received', [
            'origin' => $origin,
            'method' => $request->method(),
            'path' => $request->path(),
            'has_auth' => $request->hasHeader('Authorization') ? 'yes' : 'no',
        ]);

        // Read from config/cors.php
        $allowedOrigins = config('cors.allowed_origins', [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:3000',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://127.0.0.1:5175',
            'http://127.0.0.1:3000',
        ]);

        // Check if origin is allowed (exact match or regex pattern)
        $isAllowed = in_array($origin, $allowedOrigins) || ($origin && $this->matchesPattern($origin));

        Log::debug('[CORS] Origin check', [
            'origin' => $origin,
            'is_allowed' => $isAllowed ? 'true' : 'false',
            'has_pattern_match' => ($origin && $this->matchesPattern($origin)) ? 'yes' : 'no',
        ]);

        // Handle CORS preflight (OPTIONS)
        if ($request->isMethod('OPTIONS')) {
            return $this->handlePreflightRequest($origin, $isAllowed);
        }

        // Handle actual request
        $response = $next($request);

        // Set CORS headers on actual response
        if ($isAllowed && $origin) {
            $this->setCorsHeaders($response, $origin);
            Log::debug('[CORS] Headers set for allowed origin', ['origin' => $origin]);
        } else {
            // NEVER use wildcard with credentials - if origin not allowed, don't set Access-Control-Allow-Origin
            Log::debug('[CORS] Origin not allowed, CORS headers not set', ['origin' => $origin]);
        }

        return $response;
    }

    /**
     * Handle preflight (OPTIONS) requests
     */
    private function handlePreflightRequest(?string $origin, bool $isAllowed): Response
    {
        $response = new Response('', 200);

        if ($isAllowed && $origin) {
            $this->setCorsHeaders($response, $origin);
            Log::debug('[CORS] Preflight allowed for origin', ['origin' => $origin]);
        } else {
            Log::debug('[CORS] Preflight rejected for origin', ['origin' => $origin]);
        }

        return $response;
    }

    /**
     * Set CORS headers on response
     * ⚠️ CRITICAL: Never use wildcard '*' with credentials - always use specific origin
     */
    private function setCorsHeaders(Response $response, string $origin): void
    {
        // Always use the specific origin, never wildcard when credentials are used
        $response->headers->set('Access-Control-Allow-Origin', $origin);
        $response->headers->set('Access-Control-Allow-Credentials', 'true');

        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, Accept, X-Requested-With');
        $response->headers->set('Access-Control-Expose-Headers', 'Content-Type, Authorization');
        $response->headers->set('Access-Control-Max-Age', '3600');

        // Remove any wildcard headers that might have been set before
        // This ensures we're not accidentally returning '*' from other middleware
        if ($response->headers->get('Access-Control-Allow-Methods') === '*') {
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        }
        if ($response->headers->get('Access-Control-Allow-Headers') === '*') {
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-XSRF-TOKEN, Accept, X-Requested-With');
        }
    }

    /**
     * Check if origin matches configured patterns
     */
    private function matchesPattern(?string $origin): bool
    {
        if (!$origin) {
            return false;
        }

        $patterns = config('cors.allowed_origins_patterns', [
            '#^https://.*\.ngrok(?:-free)?\.dev$#',  // ngrok-free.dev & ngrok-dev
            '#^https://.*\.ngrok\.io$#',              // ngrok.io
            '#^http://localhost(:\d+)?$#',            // localhost with optional port
            '#^http://127\.0\.0\.1(:\d+)?$#',         // 127.0.0.1 with optional port
        ]);

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $origin)) {
                Log::debug('[CORS] Pattern match successful', [
                    'origin' => $origin,
                    'pattern' => $pattern,
                ]);
                return true;
            }
        }

        return false;
    }
}
