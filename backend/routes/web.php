<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Enums\UserRole;

Route::get('/', function () {
    return view('welcome');
});

// Broadcasting auth route - at root level, not /api
Route::post('/broadcasting/auth', function (Request $request) {
    $user = $request->user();
    $userRole = $user?->role;
    $userRoleValue = $userRole instanceof UserRole ? $userRole->value : $userRole;

    Log::info('Broadcasting Auth Request', [
        'user_id' => $user?->id,
        'user_email' => $user?->email,
        'user_role' => $userRoleValue,
        'socket_id' => $request->input('socket_id'),
        'channel_name' => $request->input('channel_name'),
        'all_input' => $request->all(),
    ]);

    try {
        $auth = Broadcast::auth($request);

        Log::info('Broadcasting Auth Success', [
            'user_id' => $user?->id,
            'channel_name' => $request->input('channel_name'),
            'auth_generated' => true,
        ]);

        return $auth;
    } catch (\Exception $e) {
        Log::error('Broadcasting Auth Exception', [
            'user_id' => $user?->id,
            'error' => $e->getMessage(),
            'channel_name' => $request->input('channel_name'),
            'trace' => $e->getTraceAsString(),
        ]);

        return response()->json(['error' => 'Unauthorized'], 403);
    }
})->middleware('auth:sanctum');
