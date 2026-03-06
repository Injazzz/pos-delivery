<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Enums\OrderStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function summary(): JsonResponse
    {
        $today     = now()->startOfDay();
        $thisMonth = now()->startOfMonth();
        $lastMonth = now()->subMonth()->startOfMonth();

        // Revenue
        $revenueToday = Payment::where('status', 'paid')
            ->whereDate('paid_at', today())
            ->sum('amount_paid');

        $revenueThisMonth = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$thisMonth, now()])
            ->sum('amount_paid');

        $revenueLastMonth = Payment::where('status', 'paid')
            ->whereBetween('paid_at', [$lastMonth, now()->subMonth()->endOfMonth()])
            ->sum('amount_paid');

        $revenueGrowth = $revenueLastMonth > 0
            ? round((($revenueThisMonth - $revenueLastMonth) / $revenueLastMonth) * 100, 1)
            : 0;

        // Orders
        $ordersToday     = Order::whereDate('created_at', today())->count();
        $ordersThisMonth = Order::whereBetween('created_at', [$thisMonth, now()])->count();
        $ordersLastMonth = Order::whereBetween('created_at', [$lastMonth, now()->subMonth()->endOfMonth()])->count();
        $ordersGrowth    = $ordersLastMonth > 0
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;

        // By status (active)
        $byStatus = collect(OrderStatus::cases())
            ->mapWithKeys(fn($s) => [
                $s->value => Order::where('status', $s->value)->count()
            ]);

        return response()->json([
            'data' => [
                'revenue' => [
                    'today'      => (float) $revenueToday,
                    'this_month' => (float) $revenueThisMonth,
                    'growth'     => $revenueGrowth,
                ],
                'orders' => [
                    'today'      => $ordersToday,
                    'this_month' => $ordersThisMonth,
                    'growth'     => $ordersGrowth,
                    'by_status'  => $byStatus,
                ],
                'users' => [
                    'total'     => User::count(),
                    'customers' => User::where('role', 'pelanggan')->count(),
                    'couriers'  => User::where('role', 'kurir')->count(),
                ],
                'menus' => [
                    'total'     => Menu::count(),
                    'available' => Menu::where('is_available', true)->count(),
                ],
            ],
        ]);
    }

    public function revenueChart(Request $request): JsonResponse
    {
        $days = $request->input('days', 7);

        $data = collect(range($days - 1, 0))->map(function ($daysAgo) {
            $date = now()->subDays($daysAgo)->toDateString();

            $revenue = Payment::where('status', 'paid')
                ->whereDate('paid_at', $date)
                ->sum('amount_paid');

            $orders = Order::whereDate('created_at', $date)->count();

            return [
                'date'    => $date,
                'label'   => now()->subDays($daysAgo)->format('d M'),
                'revenue' => (float) $revenue,
                'orders'  => $orders,
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function topMenus(): JsonResponse
    {
        $menus = DB::table('order_items')
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.created_at', '>=', now()->subDays(30))
            ->whereNotIn('orders.status', ['cancelled'])
            ->select(
                'menus.id',
                'menus.name',
                'menus.category',
                DB::raw('SUM(order_items.qty) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_items.order_id) as order_count')
            )
            ->groupBy('menus.id', 'menus.name', 'menus.category')
            ->orderByDesc('total_qty')
            ->limit(8)
            ->get();

        return response()->json(['data' => $menus]);
    }

    public function recentOrders(): JsonResponse
    {
        $orders = Order::with(['customer.user', 'payment'])
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn($order) => [
                'id'           => $order->id,
                'order_code'   => $order->order_code,
                'customer'     => $order->customer?->user->name ?? 'Walk-in',
                'order_type'   => $order->order_type->label(),
                'status'       => $order->status->value,
                'status_label' => $order->status->label(),
                'total'        => $order->formatted_total,
                'payment'      => $order->payment?->status ?? 'unpaid',
                'created_at'   => $order->created_at->diffForHumans(),
            ]);

        return response()->json(['data' => $orders]);
    }

    public function activityLogs(): JsonResponse
    {
        $logs = \Spatie\Activitylog\Models\Activity::with('causer')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'description' => $log->description,
                'causer'      => $log->causer?->name ?? 'System',
                'causer_role' => $log->causer?->role?->value ?? null,
                'created_at'  => $log->created_at->diffForHumans(),
                'created_at_full' => $log->created_at->format('d M Y H:i'),
            ]);

        return response()->json(['data' => $logs]);
    }
}
