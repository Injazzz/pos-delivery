<?php

use App\Models\User;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Manager channel — hanya role manager
|--------------------------------------------------------------------------
*/
Broadcast::channel('manager', function (User $user) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    return $userRole === UserRole::Manager->value;
});

/*
|--------------------------------------------------------------------------
| Cashier channel — kasir & manager
|--------------------------------------------------------------------------
*/
Broadcast::channel('cashier', function (User $user) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    return in_array($userRole, [UserRole::Kasir->value, UserRole::Manager->value]);
});

/*
|--------------------------------------------------------------------------
| Courier private channel — kurir yang bersangkutan saja
|--------------------------------------------------------------------------
*/
Broadcast::channel('courier.{courierId}', function (User $user, int $courierId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    return (int) $user->id === $courierId && $userRole === UserRole::Kurir->value;
});

/*
|--------------------------------------------------------------------------
| Customer private channel
|--------------------------------------------------------------------------
*/
Broadcast::channel('customer.{userId}', function (User $user, int $userId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    return (int) $user->id === $userId && $userRole === UserRole::Pelanggan->value;
});

/*
|--------------------------------------------------------------------------
| Order channel — semua yang terlibat (kasir, manager, customer pemilik)
|--------------------------------------------------------------------------
*/
Broadcast::channel('order.{orderId}', function (User $user, int $orderId) {
    $userRole = $user->role instanceof UserRole ? $user->role->value : $user->role;
    if (in_array($userRole, [UserRole::Manager->value, UserRole::Kasir->value])) {
        return true;
    }

    if ($userRole === UserRole::Pelanggan->value && $user->customer) {
        return \App\Models\Order::where('id', $orderId)
            ->where('customer_id', $user->customer->id)
            ->exists();
    }

    return false;
});
