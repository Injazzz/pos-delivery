<?php
namespace App\Enums;

enum OrderStatus: string {
    case Pending    = 'pending';
    case Processing = 'processing';
    case Cooking    = 'cooking';
    case Ready      = 'ready';
    case OnDelivery = 'on_delivery';
    case Delivered  = 'delivered';
    case Cancelled  = 'cancelled';

    // Validasi transisi status yang diizinkan per role
    public function allowedTransitions(UserRole $role): array {
        return match($role) {
            UserRole::Kasir => match($this) {
                self::Pending    => [self::Processing, self::Cancelled],
                self::Cooking    => [self::Ready],
                default          => [],
            },
            UserRole::Kurir => match($this) {
                self::Ready      => [self::OnDelivery],
                self::OnDelivery => [self::Delivered],
                default          => [],
            },
            UserRole::Pelanggan => match($this) {
                self::Delivered  => [], // handled by markReceived endpoint
                default          => [],
            },
            UserRole::Manager => OrderStatus::cases(), // bisa semua
        };
    }

    public function label(): string {
        return match($this) {
            self::Pending    => 'Menunggu',
            self::Processing => 'Diproses',
            self::Cooking    => 'Dimasak',
            self::Ready      => 'Siap',
            self::OnDelivery => 'Dikirim',
            self::Delivered  => 'Diterima',
            self::Cancelled  => 'Dibatalkan',
        };
    }
}
