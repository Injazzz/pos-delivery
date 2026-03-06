<?php

namespace App\Http\Controllers\Api\Shared;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Ambil semua notifikasi user yang login
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'data' => $notifications->map(fn($n) => [
                'id'          => $n->id,
                'type'        => class_basename($n->type),
                'data'        => $n->data,
                'read_at'     => $n->read_at?->toISOString(),
                'created_at'  => $n->created_at->toISOString(),
            ]),
            'meta' => [
                'current_page'  => $notifications->currentPage(),
                'last_page'     => $notifications->lastPage(),
                'total'         => $notifications->total(),
                'unread_count'  => $request->user()->unreadNotifications()->count(),
            ],
        ]);
    }

    /**
     * GET /api/notifications/unread-count
     */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'count' => $request->user()->unreadNotifications()->count(),
        ]);
    }

    /**
     * PATCH /api/notifications/{id}/read
     * Tandai satu notifikasi sebagai dibaca
     */
    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan.'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    /**
     * PATCH /api/notifications/read-all
     * Tandai semua notifikasi sebagai dibaca
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'Semua notifikasi ditandai sudah dibaca.']);
    }

    /**
     * DELETE /api/notifications/{id}
     * Hapus satu notifikasi
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $request->user()
            ->notifications()
            ->where('id', $id)
            ->delete();

        return response()->json(['message' => 'Notifikasi dihapus.']);
    }

    /**
     * DELETE /api/notifications
     * Hapus semua notifikasi
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $request->user()->notifications()->delete();

        return response()->json(['message' => 'Semua notifikasi dihapus.']);
    }
}
