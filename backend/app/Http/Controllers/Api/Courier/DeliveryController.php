<?php

namespace App\Http\Controllers\Api\Courier;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function index(): JsonResponse
    {
        // Akan diimplementasi di Module 7
        return response()->json(['message' => 'Coming in Module 7'], 501);
    }

    public function updateStatus(Request $request, int $deliveryId): JsonResponse
    {
        return response()->json(['message' => 'Coming in Module 7'], 501);
    }

    public function uploadProof(Request $request, int $deliveryId): JsonResponse
    {
        return response()->json(['message' => 'Coming in Module 7'], 501);
    }
}
