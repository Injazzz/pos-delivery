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
    return $user->role === UserRole::Manager;
});

/*
|--------------------------------------------------------------------------
| Cashier channel — kasir & manager
|--------------------------------------------------------------------------
*/
Broadcast::channel('cashier', function (User $user) {
    return in_array($user->role, [UserRole::Kasir, UserRole::Manager]);
});

/*
|--------------------------------------------------------------------------
| Courier private channel — kurir yang bersangkutan saja
|--------------------------------------------------------------------------
*/
Broadcast::channel('courier.{courierId}', function (User $user, int $courierId) {
    return (int) $user->id === $courierId && $user->role === UserRole::Kurir;
});

/*
|--------------------------------------------------------------------------
| Customer private channel
|--------------------------------------------------------------------------
*/
Broadcast::channel('customer.{userId}', function (User $user, int $userId) {
    return (int) $user->id === $userId && $user->role === UserRole::Pelanggan;
});

/*
|--------------------------------------------------------------------------
| Order channel — semua yang terlibat (kasir, manager, customer pemilik)
|--------------------------------------------------------------------------
*/
Broadcast::channel('order.{orderId}', function (User $user, int $orderId) {
    if (in_array($user->role, [UserRole::Manager, UserRole::Kasir])) {
        return true;
    }

    if ($user->role === UserRole::Pelanggan && $user->customer) {
        return \App\Models\Order::where('id', $orderId)
            ->where('customer_id', $user->customer->id)
            ->exists();
    }

    return false;
});
