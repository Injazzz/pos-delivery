<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Order $order) {}

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('cashier'),
            new PrivateChannel('manager'),
        ];

        // Notif ke customer jika order dari customer
        if ($this->order->customer?->user_id) {
            $channels[] = new PrivateChannel(
                "customer.{$this->order->customer->user_id}"
            );
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'order.created';
    }

    public function broadcastWith(): array
    {
        return [
            'id'           => $this->order->id,
            'order_code'   => $this->order->order_code,
            'type'         => $this->order->type->value,
            'status'       => $this->order->status->value,
            'status_label' => $this->order->status->label(),
            'total'        => $this->order->formatted_total,
            'items_count'  => $this->order->items()->count(),
            'customer'     => $this->order->customer?->user->name ?? 'Walk-in',
            'table_number' => $this->order->table_number,
            'created_at'   => $this->order->created_at->toISOString(),
        ];
    }
}
