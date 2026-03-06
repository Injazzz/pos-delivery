<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'role'       => $this->role->value,
            'role_label' => $this->role->label(),
            'phone'      => $this->phone,
            'status'     => $this->status,
            'avatar_url' => $this->avatar_url,
            'customer'   => $this->whenLoaded('customer', fn() => [
                'id'          => $this->customer->id,
                'address'     => $this->customer->address,
                'city'        => $this->customer->city,
                'postal_code' => $this->customer->postal_code,
                'notes'       => $this->customer->notes,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
