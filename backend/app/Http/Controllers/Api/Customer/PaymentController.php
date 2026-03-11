<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\InitiatePaymentRequest;
use App\Models\Order;
use App\Services\MidtransService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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
        try {
            Log::info('Midtrans webhook received', [
                'request_body' => $request->all(),
                'headers'      => $request->headers->all(),
            ]);

            // Verifikasi signature Midtrans
            $notifData = $this->midtransService->handleNotification($request->all());
            $signatureKeyFromRequest = $request->input('signature_key');

            // Validasi server key hash
            // Format: order_id + status_code + gross_amount + server_key
            $serverKey    = config('services.midtrans.server_key');
            $statusCode   = $request->input('status_code');
            $signatureKey = hash('sha512',
                $notifData['order_id'] .
                $statusCode .
                (string)$notifData['gross_amount'] .
                $serverKey
            );

            Log::info('Midtrans signature verification', [
                'provided_signature' => $signatureKeyFromRequest,
                'computed_signature' => $signatureKey,
                'match'              => $signatureKeyFromRequest === $signatureKey,
            ]);

            if ($signatureKeyFromRequest !== $signatureKey) {
                Log::warning('Midtrans webhook signature mismatch', [
                    'order_id' => $notifData['order_id'] ?? null,
                    'provided_signature' => $signatureKeyFromRequest,
                    'computed_signature' => $signatureKey,
                ]);
                return response()->json(['message' => 'Invalid signature.'], 403);
            }

            $this->paymentService->handleMidtransWebhook($notifData);

            Log::info('Midtrans webhook processed successfully', [
                'order_id' => $notifData['order_id'],
                'status'   => $notifData['transaction_status'],
            ]);

            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            Log::error('Midtrans webhook error', [
                'message'    => $e->getMessage(),
                'trace'      => $e->getTraceAsString(),
                'request'    => $request->all(),
            ]);

            return response()->json([
                'message' => 'Webhook processing error',
                'error'   => $e->getMessage(),
            ], 400);
        }
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
