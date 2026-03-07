<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * POST /api/customer/orders/{order}/review
     */
    public function store(Request $request, Order $order): JsonResponse
    {
        // Pastikan order milik customer ini
        if ($order->customer?->user_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        // Hanya bisa review order yang sudah delivered
        if (!in_array($order->status->value, ['delivered'])) {
            return response()->json([
                'message' => 'Hanya pesanan yang sudah diterima yang bisa diberi ulasan.',
            ], 422);
        }

        // Cek apakah sudah pernah review
        if ($order->review()->exists()) {
            return response()->json([
                'message' => 'Pesanan ini sudah mendapatkan ulasan.',
            ], 422);
        }

        $validated = $request->validate([
            'rating'  => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:500'],
        ]);

        $review = $order->review()->create([
            'customer_id' => $order->customer->id,
            'rating'      => $validated['rating'],
            'comment'     => $validated['comment'] ?? null,
        ]);

        activity()
            ->causedBy($request->user())
            ->performedOn($order)
            ->withProperties(['rating' => $validated['rating']])
            ->log("Memberikan ulasan {$validated['rating']} bintang untuk pesanan #{$order->order_code}");

        return response()->json([
            'message' => 'Ulasan berhasil dikirim. Terima kasih!',
            'data'    => [
                'id'         => $review->id,
                'rating'     => $review->rating,
                'comment'    => $review->comment,
                'created_at' => $review->created_at->toISOString(),
            ],
        ], 201);
    }
}
