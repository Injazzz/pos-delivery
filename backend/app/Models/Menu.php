<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Menu extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'name', 'description', 'price',
        'category', 'is_available', 'stock',
        'preparation_time', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'price'            => 'decimal:2',
            'is_available'     => 'boolean',
            'stock'            => 'integer',
            'preparation_time' => 'integer',
        ];
    }

    // ──────────────────────────────────────────
    // SPATIE MEDIA LIBRARY (Multi Image)
    // ──────────────────────────────────────────

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('menu_images')
             ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/webp'])
             ->withResponsiveImages(); // auto generate responsive sizes
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
             ->width(300)
             ->height(300)
             ->sharpen(10)
             ->nonQueued();

        $this->addMediaConversion('medium')
             ->width(600)
             ->height(600)
             ->nonQueued();
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ──────────────────────────────────────────
    // ACCESSORS
    // ──────────────────────────────────────────

    public function getFormattedPriceAttribute(): string
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    public function getFirstImageUrlAttribute(): string
    {
        $media = $this->getFirstMedia('menu_images');
        return $media
            ? $media->getUrl('medium')
            : asset('images/menu-placeholder.png');
    }

    public function getImagesAttribute(): array
    {
        return $this->getMedia('menu_images')
            ->map(fn($media) => [
                'id'     => $media->id,
                'url'    => $media->getUrl(),
                'thumb'  => $media->getUrl('thumb'),
                'medium' => $media->getUrl('medium'),
            ])->toArray();
    }

    // ──────────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────────

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    public function scopeInStock($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('stock')->orWhere('stock', '>', 0);
        });
    }

    // ──────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────

    public function decrementStock(int $qty): void
    {
        if ($this->stock !== null) {
            $this->decrement('stock', $qty);
            if ($this->stock <= 0) {
                $this->update(['is_available' => false]);
            }
        }
    }

    public function isInStock(int $qty = 1): bool
    {
        if ($this->stock === null) return true; // unlimited
        return $this->stock >= $qty;
    }
}
