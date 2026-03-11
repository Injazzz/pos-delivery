<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\Log;
use Midtrans\Config;
use Midtrans\Snap;
use Midtrans\Notification;

class MidtransService
{
    public function __construct()
    {
        Config::$serverKey    = config('services.midtrans.server_key');
        Config::$clientKey    = config('services.midtrans.client_key');
        Config::$isProduction = config('services.midtrans.is_production', false);
        Config::$isSanitized  = config('services.midtrans.is_sanitized', true);
        Config::$is3ds        = config('services.midtrans.is_3ds', true);
    }

    /**
     * Buat Snap token untuk pembayaran online
     */
    public function createSnapToken(Order $order, Payment $payment): string
    {
        $params = [
            'transaction_details' => [
                'order_id'     => $payment->midtrans_order_id,
                'gross_amount' => (int) $payment->amount,
            ],
            'customer_details' => [
                'first_name' => $order->customer?->user->name ?? 'Walk-in',
                'email'      => $order->customer?->user->email ?? 'guest@pos.com',
                'phone'      => $order->customer?->user->phone ?? '',
            ],
            'item_details' => $this->buildItemDetails($order, $payment),
            'callbacks' => [
                'finish' => config('midtrans.callback.finish_url'),
            ],
        ];

        return Snap::getSnapToken($params);
    }

    /**
     * Handle webhook notification dari Midtrans
     * @param array $requestData Data dari request (request()->all())
     */
    public function handleNotification(array $requestData = []): array
    {
        // Jika tidak ada data, coba baca dari php://input (backwards compatible)
        if (empty($requestData)) {
            $notif = new Notification();
            $data = [
                'order_id'          => $notif->order_id,
                'transaction_id'    => $notif->transaction_id,
                'transaction_status'=> $notif->transaction_status,
                'fraud_status'      => $notif->fraud_status ?? null,
                'payment_type'      => $notif->payment_type,
                'gross_amount'      => (int)$notif->gross_amount,
            ];
        } else {
            // Gunakan data dari request secara langsung (keep gross_amount as string for signature verification)
            $data = [
                'order_id'          => $requestData['order_id'] ?? null,
                'transaction_id'    => $requestData['transaction_id'] ?? null,
                'transaction_status'=> $requestData['transaction_status'] ?? null,
                'fraud_status'      => $requestData['fraud_status'] ?? null,
                'payment_type'      => $requestData['payment_type'] ?? null,
                'gross_amount'      => (string)($requestData['gross_amount'] ?? '0'),
            ];
        }

        Log::debug('Midtrans notification parsed', $data);

        return $data;
    }

    /**
     * Map Midtrans status ke internal status
     */
    public function mapStatus(string $transactionStatus, ?string $fraudStatus): string
    {
        if ($transactionStatus === 'capture') {
            return $fraudStatus === 'challenge' ? 'pending' : 'paid';
        }

        return match($transactionStatus) {
            'settlement' => 'paid',
            'pending'    => 'pending',
            'deny',
            'expire',
            'cancel'     => 'failed',
            default      => 'pending',
        };
    }

    private function buildItemDetails(Order $order, Payment $payment): array
    {
        $items = $order->items->map(fn($item) => [
            'id'       => (string) $item->menu_id,
            'price'    => (int) $item->price,
            'quantity' => $item->qty,
            'name'     => substr($item->menu->name, 0, 50),
        ])->toArray();

        // Tambah tax & delivery fee sebagai item
        if ($order->tax > 0) {
            $items[] = [
                'id'       => 'TAX',
                'price'    => (int) $order->tax,
                'quantity' => 1,
                'name'     => 'Pajak (11%)',
            ];
        }

        if ($order->delivery_fee > 0) {
            $items[] = [
                'id'       => 'DELIVERY',
                'price'    => (int) $order->delivery_fee,
                'quantity' => 1,
                'name'     => 'Ongkos Kirim',
            ];
        }

        // Jika downpayment, tampilkan sisa yang harus dibayar
        if ($payment->amount < $order->total_price) {
            $items = [[
                'id'       => 'DOWNPAYMENT',
                'price'    => (int) $payment->amount,
                'quantity' => 1,
                'name'     => "DP Pesanan #{$order->order_code}",
            ]];
        }

        return $items;
    }
}
