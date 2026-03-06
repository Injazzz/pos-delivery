<?php

namespace App\Policies;

use App\Models\Menu;
use App\Models\User;

class MenuPolicy
{
    // Siapa saja bisa lihat menu
    public function viewAny(?User $user): bool { return true; }
    public function view(?User $user, Menu $menu): bool { return true; }

    // Hanya manager yang bisa CRUD
    public function create(User $user): bool  { return $user->isManager(); }
    public function update(User $user, Menu $menu): bool { return $user->isManager(); }
    public function delete(User $user, Menu $menu): bool { return $user->isManager(); }
    public function uploadImages(User $user, Menu $menu): bool { return $user->isManager(); }
}
