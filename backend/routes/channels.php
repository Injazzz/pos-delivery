<?php

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Manager channel — hanya role manager
|--------------------------------------------------------------------------
*/
Broadcast::channel('manager', function (User $user) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    $result = $userRole === UserRole::Manager->value;
    Log::info('Channel Authorization: manager', [
        'user_id' => $user->id,
        'user_role' => $userRole,
        'authorized' => $result,
    ]);
    return $result;
});

/*
|--------------------------------------------------------------------------
| Cashier channel — kasir & manager
|--------------------------------------------------------------------------
*/
Broadcast::channel('cashier', function (User $user) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    $result = in_array($userRole, [UserRole::Kasir->value, UserRole::Manager->value]);
    Log::info('Channel Authorization: cashier', [
        'user_id' => $user->id,
        'user_role' => $userRole,
        'authorized' => $result,
    ]);
    return $result;
});

/*
|--------------------------------------------------------------------------
| Courier private channel — kurir yang bersangkutan saja
|--------------------------------------------------------------------------
*/
Broadcast::channel('courier.{courierId}', function (User $user, int $courierId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    $result = (int) $user->id === $courierId && $userRole === UserRole::Kurir->value;
    Log::info('Channel Authorization: courier', [
        'user_id' => $user->id,
        'target_courier_id' => $courierId,
        'user_role' => $userRole,
        'authorized' => $result,
    ]);
    return $result;
});

/*
|--------------------------------------------------------------------------
| Customer private channel
|--------------------------------------------------------------------------
*/
Broadcast::channel('customer.{userId}', function (User $user, int $userId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    $result = (int) $user->id === $userId && $userRole === UserRole::Pelanggan->value;
    Log::info('Channel Authorization: customer', [
        'user_id' => $user->id,
        'target_user_id' => $userId,
        'user_role' => $userRole,
        'authorized' => $result,
    ]);
    return $result;
});

/*
|--------------------------------------------------------------------------
| Order channel — semua yang terlibat (kasir, manager, customer pemilik)
|--------------------------------------------------------------------------
*/
Broadcast::channel('order.{orderId}', function (User $user, int $orderId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;

    if (in_array($userRole, [UserRole::Manager->value, UserRole::Kasir->value])) {
        Log::info('Channel Authorization: order (staff)', [
            'user_id' => $user->id,
            'order_id' => $orderId,
            'user_role' => $userRole,
            'authorized' => true,
        ]);
        return true;
    }

    if ($userRole === UserRole::Pelanggan->value && $user->customer) {
        $authorized = \App\Models\Order::where('id', $orderId)
            ->where('customer_id', $user->customer->id)
            ->exists();

        Log::info('Channel Authorization: order (customer)', [
            'user_id' => $user->id,
            'order_id' => $orderId,
            'user_role' => $userRole,
            'customer_id' => $user->customer->id,
            'authorized' => $authorized,
        ]);

        return $authorized;
    }

    Log::info('Channel Authorization: order (unauthorized)', [
        'user_id' => $user->id,
        'order_id' => $orderId,
        'user_role' => $userRole,
        'authorized' => false,
    ]);

    return false;
});
/*
|--------------------------------------------------------------------------
| User notification channel — Laravel model channel for notifications
|--------------------------------------------------------------------------
*/
Broadcast::channel('App.Models.User.{id}', function (User $user, int $id) {
    Log::info('Channel Authorization: user notifications', [
        'user_id' => $user->id,
        'target_user_id' => $id,
        'authorized' => (int) $user->id === $id,
    ]);

    // Only allow users to listen to their own notifications
    return (int) $user->id === $id;
});
