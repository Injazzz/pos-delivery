<?php
namespace App\Enums;

enum UserRole: string {
    case Manager   = 'manager';
    case Kasir     = 'kasir';
    case Pelanggan = 'pelanggan';
    case Kurir     = 'kurir';

    public function label(): string {
        return match($this) {
            self::Manager   => 'Manager',
            self::Kasir     => 'Kasir',
            self::Pelanggan => 'Pelanggan',
            self::Kurir     => 'Kurir',
        };
    }
}
