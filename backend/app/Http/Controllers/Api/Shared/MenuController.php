<?php

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MenuController extends Controller
{
    /**
     * GET /api/menus
     * GET /api/cashier/menus
     * GET /api/customer/menus
     * Public — tampilkan menu yang tersedia
     */
    public function index(Request $request): JsonResponse
    {
        $menus = Menu::query()
            ->available()
            ->inStock()
            ->when($request->category, fn($q, $v) => $q->byCategory($v))
            ->when($request->search, fn($q, $v) =>
                $q->where('name', 'like', "%{$v}%")
                  ->orWhere('description', 'like', "%{$v}%")
            )
            ->with('media')
            ->orderBy('category')
            ->orderBy('name')
            ->get();

        // Group by category
        $grouped = $menus->groupBy('category')->map(fn($items) =>
            $items->map(fn($menu) => [
                'id'               => $menu->id,
                'name'             => $menu->name,
                'description'      => $menu->description,
                'price'            => $menu->price,
                'formatted_price'  => $menu->formatted_price,
                'category'         => $menu->category,
                'is_available'     => $menu->is_available,
                'stock'            => $menu->stock,
                'preparation_time' => $menu->preparation_time,
                'first_image_url'  => $menu->first_image_url,
                'images'           => $menu->images,
            ])
        );

        return response()->json([
            'data'       => $grouped,
            'categories' => $menus->pluck('category')->unique()->values(),
        ]);
    }

    /**
     * GET /api/menus/{menu}
     */
    public function show(Menu $menu): JsonResponse
    {
        return response()->json([
            'data' => [
                'id'               => $menu->id,
                'name'             => $menu->name,
                'description'      => $menu->description,
                'price'            => $menu->price,
                'formatted_price'  => $menu->formatted_price,
                'category'         => $menu->category,
                'is_available'     => $menu->is_available,
                'stock'            => $menu->stock,
                'preparation_time' => $menu->preparation_time,
                'first_image_url'  => $menu->first_image_url,
                'images'           => $menu->images,
            ],
        ]);
    }
}
