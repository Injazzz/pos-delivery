<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Order  $order,
        public string $oldStatus,
        public string $newStatus
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('cashier'),
            new PrivateChannel('manager'),
        ];

        // Notif ke customer jika ada
        if ($this->order->customer) {
            $channels[] = new PrivateChannel("customer.{$this->order->customer->user_id}");
        }

        // Notif ke kurir jika ada delivery
        if ($this->order->delivery?->courier_id) {
            $channels[] = new PrivateChannel("courier.{$this->order->delivery->courier_id}");
        }

        return $channels;
    }

    public function broadcastAs(): string { return 'order.status.updated'; }

    public function broadcastWith(): array
    {
        return [
            'order_id'   => $this->order->id,
            'order_code' => $this->order->order_code,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
            'new_status_label' => $this->order->status->label(),
        ];
    }
}
