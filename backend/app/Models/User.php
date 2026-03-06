<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name', 'email', 'password',
        'role', 'phone', 'status', 'avatar',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'role'              => UserRole::class,
            'status'            => 'string',
        ];
    }

    // ──────────────────────────────────────────
    // RELATIONS
    // ──────────────────────────────────────────

    public function customer(): HasOne
    {
        return $this->hasOne(Customer::class);
    }

    public function ordersAsCashier(): HasMany
    {
        return $this->hasMany(Order::class, 'cashier_id');
    }

    public function deliveriesAsCourier(): HasMany
    {
        return $this->hasMany(Delivery::class, 'courier_id');
    }

    public function statusLogsUpdated(): HasMany
    {
        return $this->hasMany(OrderStatusLog::class, 'updated_by');
    }

    // ──────────────────────────────────────────
    // ROLE HELPERS
    // ──────────────────────────────────────────

    public function isManager(): bool
    {
        return $this->role === UserRole::Manager;
    }

    public function isKasir(): bool
    {
        return $this->role === UserRole::Kasir;
    }

    public function isPelanggan(): bool
    {
        return $this->role === UserRole::Pelanggan;
    }

    public function isKurir(): bool
    {
        return $this->role === UserRole::Kurir;
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function hasRole(UserRole|string ...$roles): bool
    {
        $roleValues = array_map(
            fn($r) => $r instanceof UserRole ? $r->value : $r,
            $roles
        );
        return in_array($this->role->value, $roleValues);
    }

    // ──────────────────────────────────────────
    // ACCESSORS
    // ──────────────────────────────────────────

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return asset('storage/' . $this->avatar);
        }
        // Generate avatar dari initials
        $initials = collect(explode(' ', $this->name))
            ->map(fn($word) => strtoupper($word[0]))
            ->take(2)
            ->join('');
        return "https://ui-avatars.com/api/?name={$initials}&background=0f172a&color=fff";
    }

    // ──────────────────────────────────────────
    // SCOPES
    // ──────────────────────────────────────────

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByRole($query, UserRole|string $role)
    {
        $value = $role instanceof UserRole ? $role->value : $role;
        return $query->where('role', $value);
    }

    public function scopeCouriers($query)
    {
        return $query->where('role', UserRole::Kurir->value)->where('status', 'active');
    }
}
