<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DeliveryController extends Controller
{
    public function assignCourier(Request $request, int $deliveryId): JsonResponse
    {
        // Akan diimplementasi di Module 7
        return response()->json(['message' => 'Coming in Module 7'], 501);
    }
}
