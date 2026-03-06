<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'method', 'status',
        'midtrans_transaction_id', 'midtrans_order_id',
        'midtrans_response', 'payment_url',
        'amount', 'amount_paid', 'amount_remaining',
        'cash_received', 'change_amount', 'paid_at',
    ];

    protected $hidden = ['midtrans_response']; // jangan expose raw response

    protected function casts(): array
    {
        return [
            'method'             => PaymentMethod::class,
            'midtrans_response'  => 'array',
            'amount'             => 'decimal:2',
            'amount_paid'        => 'decimal:2',
            'amount_remaining'   => 'decimal:2',
            'cash_received'      => 'decimal:2',
            'change_amount'      => 'decimal:2',
            'paid_at'            => 'datetime',
        ];
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    // ──────────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────────

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    // ──────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────

    public function isPaid(): bool
    {
        return $this->status === 'paid';
    }

    public function isPartial(): bool
    {
        return $this->status === 'partial';
    }

    public function markAsPaid(?float $amountPaid = null): void
    {
        $paid = $amountPaid ?? $this->amount;
        $this->update([
            'status'           => 'paid',
            'amount_paid'      => $paid,
            'amount_remaining' => max(0, $this->amount - $paid),
            'paid_at'          => now(),
        ]);
    }
}
