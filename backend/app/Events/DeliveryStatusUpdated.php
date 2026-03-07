<?php

namespace App\Events;

use App\Models\Delivery;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DeliveryStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Delivery $delivery,
        public string   $oldStatus,
        public string   $newStatus
    ) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('manager'),
            new PrivateChannel("courier.{$this->delivery->courier_id}"),
        ];

        if ($this->delivery->order->customer) {
            $channels[] = new PrivateChannel(
                "customer.{$this->delivery->order->customer->user_id}"
            );
        }

        return $channels;
    }

    public function broadcastAs(): string { return 'delivery.status.updated'; }

    public function broadcastWith(): array
    {
        return [
            'delivery_id'  => $this->delivery->id,
            'order_id'     => $this->delivery->order_id,
            'order_code'   => $this->delivery->order->order_code,
            'old_status'   => $this->oldStatus,
            'new_status'   => $this->newStatus,
            'courier_name' => $this->delivery->courier?->name,
        ];
    }
}
