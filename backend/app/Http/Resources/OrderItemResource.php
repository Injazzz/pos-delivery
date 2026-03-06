<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'menu_id'  => $this->menu_id,
            'menu'     => $this->whenLoaded('menu', fn() => [
                'id'              => $this->menu->id,
                'name'            => $this->menu->name,
                'category'        => $this->menu->category,
                'first_image_url' => $this->menu->first_image_url,
            ]),
            'qty'              => $this->qty,
            'price'            => (float) $this->price,
            'subtotal'         => (float) $this->subtotal,
            'formatted_price'  => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'formatted_subtotal' => 'Rp ' . number_format($this->subtotal, 0, ',', '.'),
            'note'             => $this->note,
        ];
    }
}
