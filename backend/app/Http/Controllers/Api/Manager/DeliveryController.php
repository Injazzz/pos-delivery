<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\AssignCourierRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\User;
use App\Services\DeliveryService;
use App\Enums\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        private readonly DeliveryService $deliveryService
    ) {}

    /**
     * GET /api/manager/deliveries
     */
    public function index(Request $request): JsonResponse
    {
        $deliveries = $this->deliveryService->getDeliveries(
            $request->only(['status', 'search', 'per_page', 'page']),
            $request->user()
        );

        return response()->json(
            DeliveryResource::collection($deliveries)
                ->additional(['summary' => $this->deliveryService->getSummary()])
                ->response()->getData(true)
        );
    }

    /**
     * POST /api/manager/deliveries/{delivery}/assign
     */
    public function assignCourier(AssignCourierRequest $request, Delivery $delivery): JsonResponse
    {
        $updated = $this->deliveryService->assignCourier(
            $delivery,
            $request->courier_id
        );

        return response()->json([
            'message' => 'Kurir berhasil ditugaskan.',
            'data'    => new DeliveryResource($updated),
        ]);
    }

    /**
     * GET /api/manager/couriers
     * List kurir aktif untuk dropdown assign
     */
    public function availableCouriers(): JsonResponse
    {
        $couriers = User::active()
            ->byRole(UserRole::Kurir)
            ->select('id', 'name', 'phone', 'avatar')
            ->get()
            ->map(fn($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'phone'      => $u->phone,
                'avatar_url' => $u->avatar_url,
                'active_deliveries' => \App\Models\Delivery::where('courier_id', $u->id)
                    ->whereIn('delivery_status', ['assigned', 'picked_up', 'on_way'])
                    ->count(),
            ]);

        return response()->json(['data' => $couriers]);
    }
}
