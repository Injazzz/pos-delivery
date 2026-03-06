<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
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
            $request->only(['status', 'per_page', 'page']),
            $request->user()
        );
        return response()->json(OrderResource::collection($orders)->response()->getData(true));
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

    public function show(Order $order, Request $request): JsonResponse
    {
        $this->authorize('view', $order);
        return response()->json(['data' => new OrderResource($this->orderService->getOrderDetail($order))]);
    }

    public function markReceived(Order $order, Request $request): JsonResponse
    {
        $order = $this->orderService->markReceived($order, $request->user());
        return response()->json([
            'message' => 'Pesanan ditandai sudah diterima.',
            'data'    => new OrderResource($order),
        ]);
    }
}
