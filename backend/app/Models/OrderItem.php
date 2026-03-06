<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id', 'menu_id', 'qty',
        'price', 'subtotal', 'note',
    ];

    protected function casts(): array
    {
        return [
            'qty'      => 'integer',
            'price'    => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    // ──────────────────────────────────────────
    // BOOT — Auto hitung subtotal
    // ──────────────────────────────────────────

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function (OrderItem $item) {
            $item->subtotal = $item->price * $item->qty;
        });
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class)->withTrashed();
        // withTrashed agar menu yang sudah dihapus tetap muncul di history order
    }

    // ──────────────────────────────────────────
    // ACCESSORS
    // ──────────────────────────────────────────

    public function getFormattedSubtotalAttribute(): string
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }
}
