<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'order_id'        => $this->order_id,
            'order' => $this->whenLoaded('order', fn() => [
                'id'           => $this->order->id,
                'order_code'   => $this->order->order_code,
                'status'       => $this->order->status->value,
                'status_label' => $this->order->status->label(),
                'total'        => $this->order->formatted_total,
                'customer'     => $this->order->customer?->user->name ?? 'Walk-in',
                'customer_phone' => $this->order->customer?->user->phone,
                'items_count'  => $this->order->items->count(),
            ]),
            'courier' => $this->whenLoaded('courier', fn() => $this->courier ? [
                'id'    => $this->courier->id,
                'name'  => $this->courier->name,
                'phone' => $this->courier->phone,
                'avatar_url' => $this->courier->avatar_url,
            ] : null),
            'address'          => $this->address,
            'city'             => $this->city,
            'latitude'         => $this->latitude,
            'longitude'        => $this->longitude,
            'delivery_status'  => $this->delivery_status->value,
            'delivery_status_label' => $this->delivery_status->label(),
            'delivery_fee'     => (float) $this->delivery_fee,
            'delivery_notes'   => $this->delivery_notes,
            'proof_image_url'  => $this->proof_image_url,
            'proof_image_timestamp' => $this->proof_image_timestamp?->toISOString(),
            'picked_up_at'     => $this->picked_up_at?->toISOString(),
            'delivered_at'     => $this->delivered_at?->toISOString(),
            'is_delivered'     => $this->is_delivered,
            'created_at'       => $this->created_at->toISOString(),
        ];
    }
}
