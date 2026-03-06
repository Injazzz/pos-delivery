<?php
namespace App\Enums;

enum DeliveryStatus: string {
    case Pending    = 'pending';
    case Assigned   = 'assigned';
    case PickedUp   = 'picked_up';
    case OnWay      = 'on_way';
    case Delivered  = 'delivered';
    case Failed     = 'failed';
}
