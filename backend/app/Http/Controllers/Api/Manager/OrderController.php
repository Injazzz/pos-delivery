<?php

namespace App\Http\Controllers\Api\Manager;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
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
            $request->only(['status','order_type','search','date_from','date_to','per_page','page']),
            $request->user()
        );
        return response()->json(
            OrderResource::collection($orders)
                ->additional(['stats' => $this->orderService->getDashboardStats()])
                ->response()->getData(true)
        );
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $this->authorize('updateStatus', $order);
        $updated = $this->orderService->updateStatus(
            $order,
            OrderStatus::from($request->status),
            $request->user(),
            $request->reason
        );
        return response()->json([
            'message' => 'Status pesanan diperbarui.',
            'data'    => new OrderResource($updated),
        ]);
    }
}
