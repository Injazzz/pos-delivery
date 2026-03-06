<?php
namespace App\Enums;

enum OrderType: string {
    case DineIn   = 'dine_in';
    case TakeAway = 'take_away';
    case Delivery = 'delivery';

    public function label(): string {
        return match($this) {
            self::DineIn   => 'Makan di Tempat',
            self::TakeAway => 'Bawa Pulang',
            self::Delivery => 'Delivery',
        };
    }

    public function requiresDelivery(): bool {
        return $this === self::Delivery;
    }

    public function requiresTable(): bool {
        return $this === self::DineIn;
    }
}
