<?php
namespace App\Enums;

enum DeliveryStatus: string {
    case Pending    = 'pending';
    case Assigned   = 'assigned';
    case PickedUp   = 'picked_up';
    case OnWay      = 'on_way';
    case Delivered  = 'delivered';
    case Failed     = 'failed';

    public function label(): string
    {
        return match($this) {
            self::Pending   => 'Menunggu',
            self::Assigned  => 'Kurir Ditugaskan',
            self::PickedUp  => 'Diambil Kurir',
            self::OnWay     => 'Dalam Perjalanan',
            self::Delivered => 'Terkirim',
            self::Failed    => 'Gagal',
        };
    }

    public function allowedNextStatuses(): array
    {
        return match($this) {
            self::Pending   => [self::Assigned],
            self::Assigned  => [self::PickedUp, self::Failed],
            self::PickedUp  => [self::OnWay],
            self::OnWay     => [self::Delivered, self::Failed],
            self::Delivered => [],
            self::Failed    => [],
        };
    }
}
