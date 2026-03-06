<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ReportController extends Controller
{
    public function sales(): JsonResponse
    {
        // Akan diimplementasi di Module 10
        return response()->json(['message' => 'Coming in Module 10'], 501);
    }

    public function orders(): JsonResponse
    {
        return response()->json(['message' => 'Coming in Module 10'], 501);
    }
}
