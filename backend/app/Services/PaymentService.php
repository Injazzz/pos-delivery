<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Models\Order;
use App\Models\Payment;
use App\Notifications\OrderStatusNotification;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly MidtransService $midtransService
    ) {}

    // ── Cash Payment ──────────────────────────────────────────────────────────

    public function processCash(Order $order, float $cashReceived): Payment
    {
        if ($cashReceived < $order->total_price) {
            throw ValidationException::withMessages([
                'cash_received' => ['Uang yang diterima kurang dari total tagihan.'],
            ]);
        }

        return DB::transaction(function () use ($order, $cashReceived) {
            $payment = $this->createOrUpdatePayment($order, [
                'method'         => PaymentMethod::Cash->value,
                'status'         => 'paid',
                'amount'         => $order->total_price,
                'amount_paid'    => $cashReceived,
                'amount_remaining' => 0,
                'cash_received'  => $cashReceived,
                'change_amount'  => $cashReceived - $order->total_price,
                'paid_at'        => now(),
            ]);

            $this->advanceOrderStatus($order);

            activity()->causedBy(Auth::user())->performedOn($order)
                ->log("Pembayaran cash: Rp " . number_format($cashReceived, 0, ',', '.'));

            return $payment;
        });
    }

    // ── Downpayment ───────────────────────────────────────────────────────────

    public function processDownpayment(Order $order, float $dpAmount, string $method): Payment
    {
        if ($dpAmount <= 0 || $dpAmount >= $order->total_price) {
            throw ValidationException::withMessages([
                'dp_amount' => ['Jumlah DP harus lebih dari 0 dan kurang dari total tagihan.'],
            ]);
        }

        return DB::transaction(function () use ($order, $dpAmount, $method) {
            $payment = $this->createOrUpdatePayment($order, [
                'method'           => $method,
                'status'           => 'partial',
                'amount'           => $order->total_price,
                'amount_paid'      => $dpAmount,
                'amount_remaining' => $order->total_price - $dpAmount,
                'paid_at'          => now(),
            ]);

            // Order tetap processing setelah DP
            if ($order->status === OrderStatus::Pending) {
                $order->transitionStatus(OrderStatus::Processing, Auth::user(), 'Downpayment diterima');
            }

            activity()->causedBy(Auth::user())->performedOn($order)
                ->log("Downpayment diterima: Rp " . number_format($dpAmount, 0, ',', '.'));

            return $payment;
        });
    }

    // ── Initiate Midtrans (Customer / Kasir online) ───────────────────────────

    public function initiateMidtrans(Order $order, float $amount, string $method): array
    {
        return DB::transaction(function () use ($order, $amount, $method) {
            $midtransOrderId = "POS-{$order->order_code}-" . time();

            $payment = $this->createOrUpdatePayment($order, [
                'method'             => $method,
                'status'             => 'pending',
                'amount'             => $amount,
                'amount_paid'        => 0,
                'amount_remaining'   => $amount,
                'midtrans_order_id'  => $midtransOrderId,
            ]);

            $snapToken = $this->midtransService->createSnapToken($order, $payment);

            $payment->update(['payment_url' => $snapToken]);

            return [
                'snap_token'   => $snapToken,
                'order_id'     => $midtransOrderId,
                'amount'       => $amount,
                'client_key'   => config('services.midtrans.client_key'),
                'is_production'=> config('services.midtrans.is_production'),
            ];
        });
    }

    // ── Handle Midtrans Webhook ───────────────────────────────────────────────

    public function handleMidtransWebhook(array $notifData): void
    {
        $payment = Payment::where('midtrans_order_id', $notifData['order_id'])->firstOrFail();
        $order   = $payment->order;

        $internalStatus = $this->midtransService->mapStatus(
            $notifData['transaction_status'],
            $notifData['fraud_status'] ?? null
        );

        DB::transaction(function () use ($payment, $order, $notifData, $internalStatus) {
            $payment->update([
                'status'                  => $internalStatus,
                'midtrans_transaction_id' => $notifData['transaction_id'],
                'midtrans_response'       => $notifData,
                'amount_paid'             => $internalStatus === 'paid' ? $payment->amount : $payment->amount_paid,
                'amount_remaining'        => $internalStatus === 'paid' ? 0 : $payment->amount_remaining,
                'paid_at'                 => $internalStatus === 'paid' ? now() : null,
            ]);

            if ($internalStatus === 'paid') {
                $this->advanceOrderStatus($order);

                if ($order->customer?->user) {
                    $order->customer->user->notify(
                        new OrderStatusNotification($order, $order->status->value)
                    );
                }
            }
        });
    }

    // ── Pelunasan sisa pembayaran ─────────────────────────────────────────────

    public function processRemainingPayment(Payment $payment, float $amount, string $method): Payment
    {
        if ($amount < $payment->amount_remaining) {
            throw ValidationException::withMessages([
                'amount' => ['Jumlah pembayaran kurang dari sisa tagihan.'],
            ]);
        }

        $payment->update([
            'status'           => 'paid',
            'amount_paid'      => $payment->amount_paid + $amount,
            'amount_remaining' => 0,
            'paid_at'          => now(),
        ]);

        $this->advanceOrderStatus($payment->order);

        return $payment->fresh();
    }

    // ── Receipt data ──────────────────────────────────────────────────────────

    public function getReceiptData(Order $order): array
    {
        $order->load(['customer.user', 'items.menu', 'payment', 'cashier']);

        return [
            'store_name'     => config('app.name', 'POS Delivery'),
            'store_address'  => config('app.store_address', 'Jl. Contoh No. 1'),
            'store_phone'    => config('app.store_phone', '08123456789'),
            'order_code'     => $order->order_code,
            'order_type'     => $order->order_type->label(),
            'cashier'        => $order->cashier?->name ?? 'Self-Order',
            'customer'       => $order->customer?->user->name ?? 'Walk-in',
            'table_number'   => $order->table_number,
            'items'          => $order->items->map(fn($item) => [
                'name'     => $item->menu->name,
                'qty'      => $item->qty,
                'price'    => $item->price,
                'subtotal' => $item->subtotal,
                'note'     => $item->note,
            ])->toArray(),
            'subtotal'       => $order->subtotal,
            'tax'            => $order->tax,
            'delivery_fee'   => $order->delivery_fee,
            'discount'       => $order->discount,
            'total'          => $order->total_price,
            'payment_method' => $order->payment?->method->value ?? '-',
            'amount_paid'    => $order->payment?->amount_paid ?? 0,
            'change'         => $order->payment?->change_amount ?? 0,
            'payment_status' => $order->payment?->status ?? 'unpaid',
            'paid_at'        => $order->payment?->paid_at?->format('d/m/Y H:i') ?? '-',
            'created_at'     => $order->created_at->format('d/m/Y H:i'),
            'printed_at'     => now()->format('d/m/Y H:i'),
        ];
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function createOrUpdatePayment(Order $order, array $data): Payment
    {
        return Payment::updateOrCreate(
            ['order_id' => $order->id],
            $data
        );
    }

    private function advanceOrderStatus(Order $order): void
    {
        if ($order->status === OrderStatus::Pending) {
            $order->transitionStatus(
                OrderStatus::Processing,
                Auth::user() ?? $order->cashier,
                'Pembayaran dikonfirmasi'
            );
        }
    }
}
