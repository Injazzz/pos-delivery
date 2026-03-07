<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'order_id'          => $this->order_id,
            'method'            => $this->method->value,
            'status'            => $this->status,
            'amount'            => (float) $this->amount,
            'amount_paid'       => (float) $this->amount_paid,
            'amount_remaining'  => (float) $this->amount_remaining,
            'cash_received'     => (float) $this->cash_received,
            'change_amount'     => (float) $this->change_amount,
            'payment_url'       => $this->payment_url,
            'paid_at'           => $this->paid_at?->toISOString(),
        ];
    }
}
