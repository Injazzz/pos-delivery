<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * A list of exception types with their corresponding custom log levels.
     *
     * @var array<class-string<\Throwable>, \Psr\Log\LogLevel::*>
     */
    protected $levels = [
        //
    ];

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<\Throwable>>
     */
    protected $dontReport = [
        //
    ];

    /**
     * A list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->renderable(function (Throwable $e, $request) {
            if ($request->is('api/*')) {
                return match (true) {
                    $e instanceof AuthenticationException => response()->json([
                        'message' => 'Unauthenticated. Silakan login.',
                    ], 401),

                    $e instanceof ValidationException => response()->json([
                        'message' => 'Data tidak valid.',
                        'errors'  => $e->errors(),
                    ], 422),

                    $e instanceof ModelNotFoundException,
                    $e instanceof NotFoundHttpException => response()->json([
                        'message' => 'Data tidak ditemukan.',
                    ], 404),

                    $e instanceof AccessDeniedHttpException => response()->json([
                        'message' => 'Anda tidak memiliki akses.',
                    ], 403),

                    default => response()->json([
                        'message' => 'Terjadi kesalahan server.',
                        'error'   => config('app.debug') ? $e->getMessage() : null,
                    ], 500),
                };
            }
        });
    }
}
