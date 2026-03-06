<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function initiate(Request $request): JsonResponse
    {
        // Akan diimplementasi di Module 6
        return response()->json(['message' => 'Coming in Module 6'], 501);
    }

    public function callback(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Coming in Module 6'], 501);
    }

    public function midtransWebhook(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Coming in Module 6'], 501);
    }
}
