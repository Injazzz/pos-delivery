<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Menu\StoreMenuRequest;
use App\Http\Requests\Menu\UpdateMenuRequest;
use App\Http\Requests\Menu\UploadMenuImagesRequest;
use App\Http\Resources\MenuResource;
use App\Models\Menu;
use App\Services\MenuService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MenuController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly MenuService $menuService
    ) {}

    /**
     * GET /api/manager/menus
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Menu::class);

        $menus = $this->menuService->getAll($request->only([
            'search', 'category', 'is_available',
            'sort_by', 'sort_dir', 'per_page',
        ]));

        return MenuResource::collection($menus)
            ->additional([
                'summary'    => $this->menuService->getSummary(),
                'categories' => $this->menuService->getCategories(),
            ]);
    }

    /**
     * POST /api/manager/menus
     */
    public function store(StoreMenuRequest $request): JsonResponse
    {
        $this->authorize('create', Menu::class);

        $menu = $this->menuService->create($request->validated());

        return response()->json([
            'message' => 'Menu berhasil dibuat.',
            'data'    => new MenuResource($menu),
        ], 201);
    }

    /**
     * GET /api/manager/menus/{menu}
     */
    public function show(Menu $menu): JsonResponse
    {
        $this->authorize('view', $menu);

        return response()->json([
            'data' => new MenuResource($menu->load(['creator', 'media'])),
        ]);
    }

    /**
     * PUT /api/manager/menus/{menu}
     */
    public function update(UpdateMenuRequest $request, Menu $menu): JsonResponse
    {
        $this->authorize('update', $menu);

        $updated = $this->menuService->update($menu, $request->validated());

        return response()->json([
            'message' => 'Menu berhasil diperbarui.',
            'data'    => new MenuResource($updated),
        ]);
    }

    /**
     * DELETE /api/manager/menus/{menu}
     */
    public function destroy(Menu $menu): JsonResponse
    {
        $this->authorize('delete', $menu);

        $this->menuService->delete($menu);

        return response()->json(['message' => 'Menu berhasil dihapus.']);
    }

    /**
     * POST /api/manager/menus/{menu}/images
     * Upload multiple images
     */
    public function uploadImages(UploadMenuImagesRequest $request, Menu $menu): JsonResponse
    {
        $this->authorize('uploadImages', $menu);

        $updated = $this->menuService->uploadImages($menu, $request->file('images'));

        return response()->json([
            'message' => count($request->file('images')) . ' gambar berhasil diupload.',
            'data'    => new MenuResource($updated),
        ]);
    }

    /**
     * DELETE /api/manager/menus/{menu}/images/{mediaId}
     * Hapus satu gambar
     */
    public function deleteImage(Menu $menu, int $mediaId): JsonResponse
    {
        $this->authorize('update', $menu);

        $this->menuService->deleteImage($menu, $mediaId);

        return response()->json(['message' => 'Gambar berhasil dihapus.']);
    }
}
