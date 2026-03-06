<?php

namespace App\Models;

use App\Enums\DeliveryStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'courier_id', 'address', 'city',
        'latitude', 'longitude', 'delivery_status',
        'proof_image', 'proof_image_timestamp',
        'delivery_notes', 'delivery_fee',
        'picked_up_at', 'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'delivery_status'  => DeliveryStatus::class,
            'latitude'         => 'decimal:8',
            'longitude'        => 'decimal:8',
            'delivery_fee'     => 'decimal:2',
            'picked_up_at'     => 'datetime',
            'delivered_at'     => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function courier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'courier_id');
    }

    // ──────────────────────────────────────────
    // ACCESSORS
    // ──────────────────────────────────────────

    public function getProofImageUrlAttribute(): ?string
    {
        return $this->proof_image
            ? asset('storage/' . $this->proof_image)
            : null;
    }

    public function getIsDeliveredAttribute(): bool
    {
        return $this->delivery_status === DeliveryStatus::Delivered;
    }
}
