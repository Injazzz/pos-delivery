<?php

namespace App\Http\Controllers\Api\Cashier;

use App\Http\Controllers\Controller;
use App\Http\Requests\Payment\CashPaymentRequest;
use App\Http\Resources\PaymentResource;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    /**
     * POST /api/cashier/payments/cash
     */
    public function cash(CashPaymentRequest $request): JsonResponse
    {
        $order   = Order::findOrFail($request->order_id);
        $payment = $this->paymentService->processCash($order, $request->cash_received);

        return response()->json([
            'message'      => 'Pembayaran cash berhasil.',
            'data'         => new PaymentResource($payment),
            'receipt_data' => $this->paymentService->getReceiptData($order),
        ]);
    }

    /**
     * POST /api/cashier/payments/downpayment
     */
    public function downpayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id'  => ['required', 'exists:orders,id'],
            'dp_amount' => ['required', 'numeric', 'min:1000'],
            'method'    => ['required', 'in:cash,transfer,qris'],
        ]);

        $order   = Order::findOrFail($validated['order_id']);
        $payment = $this->paymentService->processDownpayment(
            $order,
            $validated['dp_amount'],
            $validated['method']
        );

        return response()->json([
            'message' => 'Downpayment berhasil dicatat.',
            'data'    => new PaymentResource($payment),
        ]);
    }

    /**
     * POST /api/cashier/payments/remaining
     */
    public function remaining(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'exists:payments,id'],
            'amount'     => ['required', 'numeric', 'min:1000'],
            'method'     => ['required', 'in:cash,transfer,qris'],
        ]);

        $payment = \App\Models\Payment::findOrFail($validated['payment_id']);
        $updated = $this->paymentService->processRemainingPayment(
            $payment,
            $validated['amount'],
            $validated['method']
        );

        return response()->json([
            'message'      => 'Pelunasan berhasil.',
            'data'         => new PaymentResource($updated),
            'receipt_data' => $this->paymentService->getReceiptData($payment->order),
        ]);
    }

    /**
     * POST /api/cashier/payments/midtrans
     * Cashier inisiasi pembayaran Midtrans untuk customer
     */
    public function midtrans(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => ['required', 'exists:orders,id'],
            'amount'   => ['required', 'numeric', 'min:1000'],
            'method'   => ['required', 'string'],
        ]);

        $order = Order::findOrFail($validated['order_id']);

        $result = $this->paymentService->initiateMidtrans(
            $order,
            $validated['amount'],
            $validated['method']
        );

        return response()->json([
            'message' => 'Silakan selesaikan pembayaran.',
            'data'    => $result,
        ]);
    }

    /**
     * GET /api/cashier/orders/{order}/receipt
     */
    public function receipt(Order $order): JsonResponse
    {
        return response()->json([
            'data' => $this->paymentService->getReceiptData($order),
        ]);
    }
}
