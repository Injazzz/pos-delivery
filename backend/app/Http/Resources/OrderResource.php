<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'order_code'   => $this->order_code,
            'order_type'   => $this->order_type->value,
            'order_type_label' => $this->order_type->label(),
            'status'       => $this->status->value,
            'status_label' => $this->status->label(),
            'notes'        => $this->notes,
            'table_number' => $this->table_number,

            // Pricing
            'subtotal'     => (float) $this->subtotal,
            'tax'          => (float) $this->tax,
            'delivery_fee' => (float) $this->delivery_fee,
            'discount'     => (float) $this->discount,
            'total_price'  => (float) $this->total_price,
            'formatted_total' => $this->formatted_total,

            // Relations
            'customer' => $this->whenLoaded('customer', fn() => [
                'id'   => $this->customer->id,
                'name' => $this->customer->user->name ?? 'Walk-in',
                'phone' => $this->customer->user->phone ?? null,
            ]),
            'cashier' => $this->whenLoaded('cashier', fn() => [
                'id'   => $this->cashier->id,
                'name' => $this->cashier->name,
            ]),
            'items'    => OrderItemResource::collection($this->whenLoaded('items')),
            'payment'  => $this->whenLoaded('payment', fn() => [
                'id'               => $this->payment->id,
                'method'           => $this->payment->method->value,
                'status'           => $this->payment->status,
                'amount'           => (float) $this->payment->amount,
                'amount_paid'      => (float) $this->payment->amount_paid,
                'amount_remaining' => (float) $this->payment->amount_remaining,
                'paid_at'          => $this->payment->paid_at?->toISOString(),
            ]),
            'delivery' => $this->whenLoaded('delivery', fn() => [
                'id'              => $this->delivery->id,
                'address'         => $this->delivery->address,
                'delivery_status' => $this->delivery->delivery_status->value,
                'courier'         => $this->delivery->courier ? [
                    'id'   => $this->delivery->courier->id,
                    'name' => $this->delivery->courier->name,
                    'phone' => $this->delivery->courier->phone,
                ] : null,
                'delivered_at' => $this->delivery->delivered_at?->toISOString(),
            ]),
            'status_logs' => $this->whenLoaded('statusLogs', fn() =>
                $this->statusLogs->map(fn($log) => [
                    'from'       => $log->from_status,
                    'to'         => $log->to_status,
                    'reason'     => $log->reason,
                    'updated_by' => $log->updatedBy->name ?? 'System',
                    'updated_at' => $log->updated_at->toISOString(),
                ])
            ),
            'review' => $this->whenLoaded('review', fn() => $this->review ? [
                'rating'  => $this->review->rating,
                'comment' => $this->review->comment,
            ] : null),
            'estimated_ready_at' => $this->estimated_ready_at?->toISOString(),
            'created_at'         => $this->created_at->toISOString(),
        ];
    }
}
