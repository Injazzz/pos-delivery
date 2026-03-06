<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // semua role bisa lihat (difilter di controller)
    }

    public function view(User $user, Order $order): bool
    {
        return match(true) {
            $user->isManager() => true,
            $user->isKasir()   => true,
            $user->isPelanggan() => $order->customer?->user_id === $user->id,
            $user->isKurir()   => $order->delivery?->courier_id === $user->id,
            default => false,
        };
    }

    public function create(User $user): bool
    {
        return $user->isKasir() || $user->isPelanggan() || $user->isManager();
    }

    public function updateStatus(User $user, Order $order): bool
    {
        if ($user->isManager()) return true;

        $allowed = $order->status->allowedTransitions($user->role);
        return count($allowed) > 0;
    }

    public function cancel(User $user, Order $order): bool
    {
        // Kasir & manager bisa cancel
        // Pelanggan hanya bisa cancel saat pending
        if ($user->isManager() || $user->isKasir()) return true;
        if ($user->isPelanggan()) {
            return $order->customer?->user_id === $user->id
                && $order->status === OrderStatus::Pending;
        }
        return false;
    }
}
