<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class NewOrderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title'      => 'Pesanan Baru!',
            'message'    => "Pesanan #{$this->order->order_code} masuk — {$this->order->formatted_total}",
            'order_id'   => $this->order->id,
            'order_code' => $this->order->order_code,
            'order_type' => $this->order->order_type->value,
        ]);
    }
}
