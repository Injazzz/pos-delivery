<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Akan diimplementasi di Module 10
        return response()->json(['message' => 'Coming in Module 10'], 501);
    }
}
