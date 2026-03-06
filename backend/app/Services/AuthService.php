<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Login user dan return token
     *
     * @throws ValidationException
     */
    public function login(array $data): array
    {
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        if (!$user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['Akun Anda tidak aktif. Hubungi administrator.'],
            ]);
        }

        // Hapus token lama dari device yang sama (opsional)
        $deviceName = $data['device'] ?? 'web';
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken(
            $deviceName,
            $this->getAbilitiesForRole($user->role)
        )->plainTextToken;

        return [
            'user'  => $user->load('customer'),
            'token' => $token,
        ];
    }

    /**
     * Register pelanggan baru (registrasi publik)
     */
    public function register(array $data): array
    {
        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => $data['password'], // auto-hashed via cast
            'role'     => UserRole::Pelanggan->value,
            'phone'    => $data['phone'] ?? null,
            'status'   => 'active',
        ]);

        // Auto-create customer profile
        Customer::create([
            'user_id' => $user->id,
            'address' => null,
        ]);

        $token = $user->createToken(
            'web',
            $this->getAbilitiesForRole($user->role)
        )->plainTextToken;

        return [
            'user'  => $user->load('customer'),
            'token' => $token,
        ];
    }

    /**
     * Logout — revoke current token
     */
    public function logout(User $user): void
    {
        if ($user->currentAccessToken()) {
            $user->tokens()
                ->where('id', $user->currentAccessToken()->id)
                ->delete();
        }
    }

    /**
     * Logout dari semua device
     */
    public function logoutAllDevices(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Kirim link reset password
     */
    public function sendResetLink(string $email): string
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return $status;
    }

    /**
     * Reset password
     */
    public function resetPassword(array $data): string
    {
        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => $password])->save();
            $user->tokens()->delete(); // logout semua device setelah reset
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => [__($status)],
            ]);
        }

        return $status;
    }

    /**
     * Abilities per role untuk Sanctum token
     * Ini memungkinkan fine-grained permission di level token
     */
    private function getAbilitiesForRole(UserRole $role): array
    {
        return match ($role) {
            UserRole::Manager   => ['*'], // semua kemampuan
            UserRole::Kasir     => [
                'orders:read', 'orders:create', 'orders:update-status',
                'payments:create', 'menus:read', 'receipts:print',
            ],
            UserRole::Kurir     => [
                'deliveries:read', 'deliveries:update-status',
                'deliveries:upload-proof',
            ],
            UserRole::Pelanggan => [
                'orders:create', 'orders:read-own',
                'menus:read', 'payments:create-own',
                'reviews:create',
            ],
        };
    }
}
