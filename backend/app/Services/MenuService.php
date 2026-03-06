<?php

namespace App\Services;

use App\Models\Menu;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class MenuService
{
    public function getAll(array $filters = []): LengthAwarePaginator
    {
        return Menu::query()
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where('name', 'like', "%{$v}%")
                  ->orWhere('description', 'like', "%{$v}%")
            )
            ->when($filters['category'] ?? null, fn($q, $v) => $q->byCategory($v))
            ->when(isset($filters['is_available']), fn($q) =>
                $q->where('is_available', filter_var($filters['is_available'], FILTER_VALIDATE_BOOLEAN))
            )
            ->with(['creator', 'media'])
            ->withTrashed($filters['with_trashed'] ?? false)
            ->orderBy($filters['sort_by'] ?? 'created_at', $filters['sort_dir'] ?? 'desc')
            ->paginate($filters['per_page'] ?? 20);
    }

    public function getCategories(): array
    {
        return Menu::withoutTrashed()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category')
            ->toArray();
    }

    public function create(array $data): Menu
    {
        $menu = Menu::create([
            'name'             => $data['name'],
            'description'      => $data['description'] ?? null,
            'price'            => $data['price'],
            'category'         => $data['category'],
            'is_available'     => $data['is_available'] ?? true,
            'stock'            => $data['stock'] ?? null,
            'preparation_time' => $data['preparation_time'] ?? 15,
            'created_by'       => Auth::id(),
        ]);

        activity()
            ->causedBy(Auth::user())
            ->performedOn($menu)
            ->log("Membuat menu baru: {$menu->name}");

        return $menu->load(['creator', 'media']);
    }

    public function update(Menu $menu, array $data): Menu
    {
        $menu->update(array_filter($data, fn($v) => $v !== null));

        activity()
            ->causedBy(Auth::user())
            ->performedOn($menu)
            ->log("Mengupdate menu: {$menu->name}");

        return $menu->fresh()->load(['creator', 'media']);
    }

    public function delete(Menu $menu): void
    {
        activity()
            ->causedBy(Auth::user())
            ->performedOn($menu)
            ->log("Menghapus menu: {$menu->name}");

        $menu->delete();
    }

    /**
     * Upload multiple images ke Spatie Media Library
     */
    public function uploadImages(Menu $menu, array $files): Menu
    {
        foreach ($files as $file) {
            $menu->addMedia($file)
                 ->usingFileName(uniqid('menu_') . '.' . $file->getClientOriginalExtension())
                 ->toMediaCollection('menu_images');
        }

        activity()
            ->causedBy(Auth::user())
            ->performedOn($menu)
            ->withProperties(['count' => count($files)])
            ->log("Upload {count} gambar untuk menu: {$menu->name}");

        return $menu->fresh()->load('media');
    }

    /**
     * Hapus satu gambar
     */
    public function deleteImage(Menu $menu, int $mediaId): void
    {
        $media = $menu->getMedia('menu_images')->find($mediaId);

        if (!$media) {
            abort(404, 'Gambar tidak ditemukan.');
        }

        $media->delete();
    }

    public function getSummary(): array
    {
        return [
            'total'       => Menu::count(),
            'available'   => Menu::where('is_available', true)->count(),
            'unavailable' => Menu::where('is_available', false)->count(),
            'categories'  => Menu::select('category')->distinct()->count(),
        ];
    }
}
