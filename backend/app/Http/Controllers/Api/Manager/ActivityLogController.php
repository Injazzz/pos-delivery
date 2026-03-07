<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    /**
     * GET /api/manager/activity-logs
     */
    public function index(Request $request): JsonResponse
    {
        $logs = Activity::with('causer:id,name,role', 'subject')
            ->when($request->causer_id, fn($q, $v) =>
                $q->where('causer_id', $v)
            )
            ->when($request->log_name, fn($q, $v) =>
                $q->where('log_name', $v)
            )
            ->when($request->search, fn($q, $v) =>
                $q->where('description', 'like', "%{$v}%")
            )
            ->when($request->from, fn($q, $v) =>
                $q->whereDate('created_at', '>=', $v)
            )
            ->when($request->to, fn($q, $v) =>
                $q->whereDate('created_at', '<=', $v)
            )
            ->latest()
            ->paginate($request->input('per_page', 25))
            ->through(fn($log) => [
                'id'          => $log->id,
                'description' => $log->description,
                'log_name'    => $log->log_name,
                'event'       => $log->event,
                'causer'      => $log->causer ? [
                    'id'   => $log->causer->id,
                    'name' => $log->causer->name,
                    'role' => $log->causer->role->value ?? '-',
                ] : null,
                'subject_type' => $log->subject_type
                    ? class_basename($log->subject_type)
                    : null,
                'subject_id'   => $log->subject_id,
                'properties'   => $log->properties->toArray(),
                'created_at'   => $log->created_at->toISOString(),
            ]);

        return response()->json($logs);
    }

    /**
     * GET /api/manager/activity-logs/summary
     */
    public function summary(): JsonResponse
    {
        return response()->json([
            'data' => [
                'today'    => Activity::whereDate('created_at', today())->count(),
                'this_week'=> Activity::whereBetween('created_at', [
                    now()->startOfWeek(), now()->endOfWeek(),
                ])->count(),
                'log_names' => Activity::select('log_name')
                    ->groupBy('log_name')
                    ->pluck('log_name'),
            ],
        ]);
    }
}
