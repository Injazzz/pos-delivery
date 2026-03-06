<?php

namespace App\Http\Controllers\Api\Cashier;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly OrderService $orderService) {}

    public function index(Request $request): JsonResponse
    {
        $orders = $this->orderService->getOrders(
            $request->only(['status', 'order_type', 'search', 'per_page', 'page']),
            $request->user()
        );
        return response()->json(
            OrderResource::collection($orders)
                ->additional(['stats' => $this->orderService->getDashboardStats()])
                ->response()->getData(true)
        );
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        $this->authorize('create', Order::class);
        $order = $this->orderService->createOrder($request->validated(), $request->user());
        return response()->json([
            'message' => 'Pesanan berhasil dibuat.',
            'data'    => new OrderResource($order),
        ], 201);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('updateStatus', $order);
        $newStatus = OrderStatus::from($request->status);
        $updated   = $this->orderService->updateStatus($order, $newStatus, $request->user(), $request->reason);
        return response()->json([
            'message' => 'Status pesanan diperbarui.',
            'data'    => new OrderResource($updated),
        ]);
    }

    public function receipt(Order $order): JsonResponse
    {
        $this->authorize('view', $order);
        return response()->json(['data' => $this->orderService->getReceiptData($order)]);
    }
}
