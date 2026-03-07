<?php

namespace App\Http\Controllers\Api\Courier;

use App\Enums\DeliveryStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Delivery\UpdateDeliveryStatusRequest;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Services\DeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function __construct(
        private readonly DeliveryService $deliveryService
    ) {}

    /**
     * GET /api/courier/deliveries
     */
    public function index(Request $request): JsonResponse
    {
        $deliveries = $this->deliveryService->getDeliveries(
            $request->only(['status', 'per_page', 'page']),
            $request->user()
        );

        return response()->json(
            DeliveryResource::collection($deliveries)
                ->additional([
                    'active' => $this->deliveryService->getActiveDeliveries($request->user()),
                ])
                ->response()->getData(true)
        );
    }

    /**
     * PATCH /api/courier/deliveries/{delivery}/status
     */
    public function updateStatus(UpdateDeliveryStatusRequest $request, Delivery $delivery): JsonResponse
    {
        $updated = $this->deliveryService->updateStatus(
            $delivery,
            DeliveryStatus::from($request->status),
            $request->user(),
            $request->notes
        );

        return response()->json([
            'message' => 'Status pengiriman diperbarui.',
            'data'    => new DeliveryResource($updated),
        ]);
    }

    /**
     * POST /api/courier/deliveries/{delivery}/proof
     */
    public function uploadProof(Request $request, Delivery $delivery): JsonResponse
    {
        $request->validate([
            'proof_image' => ['required', 'image', 'mimes:jpg,jpeg,png', 'max:5120'],
        ]);

        $updated = $this->deliveryService->uploadProof(
            $delivery,
            $request->file('proof_image'),
            $request->user()
        );

        return response()->json([
            'message' => 'Foto bukti berhasil diupload.',
            'data'    => new DeliveryResource($updated),
        ]);
    }
}
