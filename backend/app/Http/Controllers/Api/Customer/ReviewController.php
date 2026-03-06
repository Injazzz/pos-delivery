<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, int $orderId): JsonResponse
    {
        // Akan diimplementasi di Module 5
        return response()->json(['message' => 'Coming in Module 5'], 501);
    }
}
