<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\ProfileController;
use App\Http\Controllers\Api\Manager;
use App\Http\Controllers\Api\Cashier;
use App\Http\Controllers\Api\Customer;
use App\Http\Controllers\Api\Courier;
use App\Http\Controllers\Api\Shared;

// =====================
// PUBLIC ROUTES
// =====================
Route::prefix('auth')->group(function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::post('register', [AuthController::class, 'register']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// Menu public (untuk display tanpa login)
Route::get('menus', [Shared\MenuController::class, 'index']);
Route::get('menus/{menu}', [Shared\MenuController::class, 'show']);

// =====================
// AUTHENTICATED ROUTES
// =====================
Route::middleware('auth:sanctum')->group(function () {

    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::get('auth/me', [AuthController::class, 'me']);

    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/',                [ProfileController::class, 'show']);
        Route::put('/',                [ProfileController::class, 'update']);
        Route::post('/avatar',         [ProfileController::class, 'updateAvatar']);
        Route::post('/change-password',[ProfileController::class, 'changePassword']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',              [Shared\NotificationController::class, 'index']);
        Route::get('/unread-count',  [Shared\NotificationController::class, 'unreadCount']);
        Route::patch('/read-all',    [Shared\NotificationController::class, 'markAllAsRead']);
        Route::delete('/',           [Shared\NotificationController::class, 'destroyAll']);
        Route::patch('/{id}/read',   [Shared\NotificationController::class, 'markAsRead']);
        Route::delete('/{id}',       [Shared\NotificationController::class, 'destroy']);
    });

    // ── MANAGER ──────────────────────────────────
    Route::middleware('role:manager')->prefix('manager')->group(function () {
        Route::get('dashboard/summary',      [Manager\DashboardController::class, 'summary']);
        Route::get('dashboard/revenue-chart',[Manager\DashboardController::class, 'revenueChart']);
        Route::get('dashboard/top-menus',    [Manager\DashboardController::class, 'topMenus']);
        Route::get('dashboard/recent-orders',[Manager\DashboardController::class, 'recentOrders']);
        Route::get('dashboard/activity-logs',[Manager\DashboardController::class, 'activityLogs']);
        Route::apiResource('users', Manager\UserController::class);
        Route::patch('users/{user}/toggle-status',  [Manager\UserController::class, 'toggleStatus']);
        Route::post('users/{user}/reset-password',  [Manager\UserController::class, 'resetPassword']);
        Route::apiResource('menus', Manager\MenuController::class);
        Route::post('menus/{menu}/images', [Manager\MenuController::class, 'uploadImages']);
        Route::delete('menus/{menu}/images/{media}', [Manager\MenuController::class, 'deleteImage']);
        Route::get('orders', [Manager\OrderController::class, 'index']);
        Route::patch('orders/{order}/status', [Manager\OrderController::class, 'updateStatus']);
        Route::get('reports/sales', [Manager\ReportController::class, 'sales']);
        Route::get('reports/orders', [Manager\ReportController::class, 'orders']);
        Route::get('activity-logs', [Manager\ActivityLogController::class, 'index']);
        Route::post('deliveries/{delivery}/assign', [Manager\DeliveryController::class, 'assignCourier']);
    });

    // ── CASHIER ───────────────────────────────────
    Route::middleware('role:kasir,manager')->prefix('cashier')->group(function () {
        Route::get('orders', [Cashier\OrderController::class, 'index']);
        Route::post('orders', [Cashier\OrderController::class, 'store']);
        Route::patch('orders/{order}/status', [Cashier\OrderController::class, 'updateStatus']);
        Route::get('orders/{order}/receipt', [Cashier\OrderController::class, 'receipt']);
        Route::post('payments', [Cashier\PaymentController::class, 'store']);
        Route::get('menus', [Shared\MenuController::class, 'index']);
    });

    // ── CUSTOMER ──────────────────────────────────
    Route::middleware('role:pelanggan,manager')->prefix('customer')->group(function () {
        Route::get('menus', [Shared\MenuController::class, 'index']);
        Route::post('orders', [Customer\OrderController::class, 'store']);
        Route::get('orders', [Customer\OrderController::class, 'index']);
        Route::get('orders/{order}', [Customer\OrderController::class, 'show']);
        Route::patch('orders/{order}/received', [Customer\OrderController::class, 'markReceived']);
        Route::post('orders/{order}/review', [Customer\ReviewController::class, 'store']);
        Route::post('payments/initiate', [Customer\PaymentController::class, 'initiate']);
        Route::post('payments/callback', [Customer\PaymentController::class, 'callback']);
    });

    // ── COURIER ───────────────────────────────────
    Route::middleware('role:kurir,manager')->prefix('courier')->group(function () {
        Route::get('deliveries', [Courier\DeliveryController::class, 'index']);
        Route::patch('deliveries/{delivery}/status', [Courier\DeliveryController::class, 'updateStatus']);
        Route::post('deliveries/{delivery}/proof', [Courier\DeliveryController::class, 'uploadProof']);
    });
});

// Midtrans webhook
Route::post('payments/midtrans/webhook', [Customer\PaymentController::class, 'midtransWebhook']);
