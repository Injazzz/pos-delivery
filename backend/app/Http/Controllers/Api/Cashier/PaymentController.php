<?php

namespace App\Http\Controllers\Api\Cashier;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        // Akan diimplementasi di Module 6
        return response()->json(['message' => 'Coming in Module 6'], 501);
    }
}
