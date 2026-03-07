<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Models\Order;
use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService  $paymentService,
        private readonly MidtransService $midtransService
    ) {}

    /**
     * POST /api/customer/payments/initiate
     * Customer inisiasi pembayaran online
     */
    public function initiate(InitiatePaymentRequest $request): JsonResponse
    {
        $order = Order::findOrFail($request->order_id);

        // Pastikan order milik customer ini
        if ($order->customer?->user_id !== $request->user()->id) {
            abort(403, 'Akses ditolak.');
        }

        $result = $this->paymentService->initiateMidtrans(
            $order,
            $request->amount,
            $request->method
        );

        return response()->json([
            'message' => 'Silakan selesaikan pembayaran.',
            'data'    => $result,
        ]);
    }

    /**
     * POST /api/payments/midtrans/webhook
     * Dipanggil oleh Midtrans server (tanpa auth)
     */
    public function midtransWebhook(Request $request): JsonResponse
    {
        // Verifikasi signature Midtrans
        $notifData = $this->midtransService->handleNotification();

        // Validasi server key hash
        $serverKey    = config('services.midtrans.server_key');
        $signatureKey = hash('sha512',
            $notifData['order_id'] .
            $notifData['transaction_status'] .
            $notifData['gross_amount'] .
            $serverKey
        );

        if ($request->signature_key !== $signatureKey) {
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        $this->paymentService->handleMidtransWebhook($notifData);

        return response()->json(['message' => 'OK']);
    }

    /**
     * POST /api/customer/payments/callback
     * Callback setelah Snap selesai (optional, untuk SPA)
     */
    public function callback(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Callback diterima.']);
    }
}
