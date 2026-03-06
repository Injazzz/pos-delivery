<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Customer;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Manager ─────────────────────────────
        User::create([
            'name'     => 'Admin Manager',
            'email'    => 'manager@pos.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Manager->value,
            'phone'    => '08111111111',
            'status'   => 'active',
        ]);

        // ── Kasir ────────────────────────────────
        User::create([
            'name'     => 'Budi Kasir',
            'email'    => 'kasir@pos.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Kasir->value,
            'phone'    => '08222222222',
            'status'   => 'active',
        ]);

        // ── Kurir ────────────────────────────────
        User::create([
            'name'     => 'Andi Kurir',
            'email'    => 'kurir@pos.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Kurir->value,
            'phone'    => '08333333333',
            'status'   => 'active',
        ]);

        // ── Pelanggan ────────────────────────────
        $pelanggan = User::create([
            'name'     => 'Siti Pelanggan',
            'email'    => 'customer@pos.com',
            'password' => Hash::make('password'),
            'role'     => UserRole::Pelanggan->value,
            'phone'    => '08444444444',
            'status'   => 'active',
        ]);

        Customer::create([
            'user_id' => $pelanggan->id,
            'address' => 'Jl. Sudirman No. 1',
            'city'    => 'Jakarta',
            'notes'   => 'Pelanggan setia',
        ]);

        // ── Menu ─────────────────────────────────
        $manager = User::where('role', UserRole::Manager->value)->first();

        $categories = ['Makanan', 'Minuman', 'Snack', 'Dessert'];
        $menus = [
            ['name' => 'Nasi Goreng Spesial',  'price' => 35000, 'category' => 'Makanan'],
            ['name' => 'Mie Ayam Bakso',        'price' => 30000, 'category' => 'Makanan'],
            ['name' => 'Ayam Bakar',            'price' => 45000, 'category' => 'Makanan'],
            ['name' => 'Es Teh Manis',          'price' => 8000,  'category' => 'Minuman'],
            ['name' => 'Jus Alpukat',           'price' => 18000, 'category' => 'Minuman'],
            ['name' => 'Kopi Hitam',            'price' => 12000, 'category' => 'Minuman'],
            ['name' => 'Kentang Goreng',        'price' => 20000, 'category' => 'Snack'],
            ['name' => 'Es Krim Coklat',        'price' => 22000, 'category' => 'Dessert'],
        ];

        foreach ($menus as $menu) {
            Menu::create([
                ...$menu,
                'description'      => "Deskripsi {$menu['name']}",
                'is_available'     => true,
                'preparation_time' => rand(10, 25),
                'created_by'       => $manager->id,
            ]);
        }
    }
}
