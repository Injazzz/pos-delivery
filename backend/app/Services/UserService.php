<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class UserService
{
    /**
     * Ambil daftar user dengan filter & pagination
     */
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return User::query()
            ->when(isset($filters['search']), function ($q) use ($filters) {
                $q->where(function ($q2) use ($filters) {
                    $q2->where('name',  'like', "%{$filters['search']}%")
                       ->orWhere('email', 'like', "%{$filters['search']}%")
                       ->orWhere('phone', 'like', "%{$filters['search']}%");
                });
            })
            ->when(isset($filters['role']), fn($q) =>
                $q->where('role', $filters['role'])
            )
            ->when(isset($filters['status']), fn($q) =>
                $q->where('status', $filters['status'])
            )
            ->with('customer')
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Buat user baru
     */
    public function create(array $data): User
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'],
            'role'     => $data['role'],
            'phone'    => $data['phone'] ?? null,
            'status'   => $data['status'] ?? 'active',
        ]);

        // Auto-create customer profile jika role pelanggan
        if ($user->role === UserRole::Pelanggan) {
            Customer::create(['user_id' => $user->id]);
        }

        // Log activity
        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->withProperties(['role' => $user->role->value])
            ->log("Membuat user baru: {$user->name}");

        return $user->load('customer');
    }

    /**
     * Update user
     */
    public function update(User $user, array $data): User
    {
        $oldRole = $user->role;

        $updateData = array_filter([
            'name'   => $data['name']   ?? null,
            'email'  => $data['email']  ?? null,
            'role'   => $data['role']   ?? null,
            'phone'  => $data['phone']  ?? null,
            'status' => $data['status'] ?? null,
        ], fn($v) => $v !== null);

        if (!empty($data['password'])) {
            $updateData['password'] = $data['password'];
        }

        $user->update($updateData);

        // Jika role berubah ke pelanggan, pastikan ada customer profile
        if (isset($data['role']) && $data['role'] === UserRole::Pelanggan->value && !$user->customer) {
            Customer::create(['user_id' => $user->id]);
        }

        // Jika role berubah, revoke semua token (paksa login ulang)
        if (isset($data['role']) && $data['role'] !== $oldRole->value) {
            $user->tokens()->delete();
        }

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Mengupdate user: {$user->name}");

        return $user->fresh()->load('customer');
    }

    /**
     * Hapus user (soft delete)
     */
    public function delete(User $user): void
    {
        // Revoke semua token
        $user->tokens()->delete();

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Menghapus user: {$user->name}");

        $user->delete();
    }

    /**
     * Toggle status aktif/nonaktif
     */
    public function toggleStatus(User $user): User
    {
        $newStatus = $user->status === 'active' ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        // Jika dinonaktifkan, revoke semua token
        if ($newStatus === 'inactive') {
            $user->tokens()->delete();
        }

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Mengubah status user {$user->name} menjadi {$newStatus}");

        return $user->fresh();
    }

    /**
     * Reset password oleh manager
     */
    public function resetPassword(User $user, string $newPassword): void
    {
        $user->update(['password' => $newPassword]);
        $user->tokens()->delete(); // paksa login ulang

        activity()
            ->causedBy(Auth::user())
            ->performedOn($user)
            ->log("Reset password user: {$user->name}");
    }

    /**
     * Summary statistik user
     */
    public function getSummary(): array
    {
        return [
            'total'     => User::count(),
            'active'    => User::where('status', 'active')->count(),
            'inactive'  => User::where('status', 'inactive')->count(),
            'by_role'   => collect(UserRole::cases())->mapWithKeys(fn($role) => [
                $role->value => User::where('role', $role->value)->count()
            ])->toArray(),
        ];
    }
}
