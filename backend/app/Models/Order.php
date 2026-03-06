<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\OrderType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'order_code', 'customer_id', 'cashier_id',
        'order_type', 'status', 'subtotal', 'tax',
        'delivery_fee', 'discount', 'total_price',
        'notes', 'table_number', 'estimated_ready_at',
    ];

    protected function casts(): array
    {
        return [
            'order_type'         => OrderType::class,
            'status'             => OrderStatus::class,
            'subtotal'           => 'decimal:2',
            'tax'                => 'decimal:2',
            'delivery_fee'       => 'decimal:2',
            'discount'           => 'decimal:2',
            'total_price'        => 'decimal:2',
            'estimated_ready_at' => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // BOOT — Auto generate order_code
    // ──────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Order $order) {
            if (empty($order->order_code)) {
                $order->order_code = static::generateOrderCode();
            }
        });
    }

    public static function generateOrderCode(): string
    {
        $date   = now()->format('Ymd');
        $prefix = "INV-{$date}";
        $last   = static::where('order_code', 'like', "{$prefix}%")
                        ->lockForUpdate()
                        ->count();
        $seq    = str_pad($last + 1, 4, '0', STR_PAD_LEFT);
        return "{$prefix}-{$seq}";
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function cashier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cashier_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function delivery(): HasOne
    {
        return $this->hasOne(Delivery::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function statusLogs(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class)->orderBy('updated_at');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }

    // ──────────────────────────────────────────
    // STATUS TRANSITION LOGIC (Core Business Logic)
    // ──────────────────────────────────────────

    /**
     * Cek apakah status bisa diubah oleh user dengan role tertentu
     */
    public function canTransitionTo(OrderStatus $newStatus, User $user): bool
    {
        if ($user->isManager()) {
            // Manager bisa ubah ke status apa pun KECUALI ke status yang sama
            return $this->status !== $newStatus;
        }

        $allowed = $this->status->allowedTransitions($user->role);
        return in_array($newStatus, $allowed);
    }

    /**
     * Lakukan transisi status dengan log otomatis
     */
    public function transitionStatus(OrderStatus $newStatus, User $user, ?string $reason = null): void
    {
        $fromStatus = $this->status->value;

        $this->update(['status' => $newStatus]);

        // Catat log perubahan status
        $this->statusLogs()->create([
            'from_status' => $fromStatus,
            'to_status'   => $newStatus->value,
            'updated_by'  => $user->id,
            'reason'      => $reason,
            'updated_at'  => now(),
        ]);
    }

    // ──────────────────────────────────────────
    // ACCESSORS
    // ──────────────────────────────────────────

    public function getFormattedTotalAttribute(): string
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    public function getIsPaidAttribute(): bool
    {
        return $this->payment?->status === 'paid';
    }

    public function getIsDeliveryAttribute(): bool
    {
        return $this->order_type === OrderType::Delivery;
    }

    // ──────────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────────

    public function scopeByStatus($query, OrderStatus|string $status)
    {
        $value = $status instanceof OrderStatus ? $status->value : $status;
        return $query->where('status', $value);
    }

    public function scopeToday($query)
    {
        return $query->whereDate('created_at', today());
    }

    public function scopeThisMonth($query)
    {
        return $query->whereMonth('created_at', now()->month)
                     ->whereYear('created_at', now()->year);
    }

    public function scopeDelivery($query)
    {
        return $query->where('order_type', OrderType::Delivery->value);
    }

    public function scopePending($query)
    {
        return $query->where('status', OrderStatus::Pending->value);
    }

    // ──────────────────────────────────────────
    // BUSINESS LOGIC HELPERS
    // ──────────────────────────────────────────

    public function calculateTotals(): void
    {
        $subtotal = $this->items->sum('subtotal');
        $tax      = $subtotal * 0.11; // PPN 11%
        $total    = $subtotal + $tax + $this->delivery_fee - $this->discount;

        $this->update([
            'subtotal'    => $subtotal,
            'tax'         => $tax,
            'total_price' => $total,
        ]);
    }
}
