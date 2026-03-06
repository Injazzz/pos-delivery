<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Hanya manager yang bisa kelola user
     */
    public function viewAny(User $auth): bool
    {
        return $auth->isManager();
    }

    public function view(User $auth, User $target): bool
    {
        // Manager bisa lihat semua, user lain hanya bisa lihat diri sendiri
        return $auth->isManager() || $auth->id === $target->id;
    }

    public function create(User $auth): bool
    {
        return $auth->isManager();
    }

    public function update(User $auth, User $target): bool
    {
        if (!$auth->isManager()) return false;
        // Manager tidak bisa edit manager lain (hanya diri sendiri)
        if ($target->isManager() && $auth->id !== $target->id) return false;
        return true;
    }

    public function delete(User $auth, User $target): bool
    {
        if (!$auth->isManager()) return false;
        // Tidak bisa hapus diri sendiri
        if ($auth->id === $target->id) return false;
        // Tidak bisa hapus manager lain
        if ($target->isManager()) return false;
        return true;
    }

    public function toggleStatus(User $auth, User $target): bool
    {
        return $this->update($auth, $target);
    }
}
