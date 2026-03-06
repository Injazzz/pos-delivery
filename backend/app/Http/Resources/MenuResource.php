<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MenuResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'price'            => (float) $this->price,
            'formatted_price'  => $this->formatted_price,
            'category'         => $this->category,
            'is_available'     => $this->is_available,
            'stock'            => $this->stock,
            'preparation_time' => $this->preparation_time,
            'first_image_url'  => $this->first_image_url,
            'images'           => $this->images,
            'creator'          => $this->whenLoaded('creator', fn() => [
                'id'   => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
