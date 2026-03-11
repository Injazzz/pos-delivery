<?php

namespace App\Http\Controllers\Api\Manager;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use App\Models\Order;
use App\Models\OrderItem;
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

        // Orders (exclude cancelled & pending - hanya hitung order yang sudah diproses)
        $ordersToday     = Order::whereDate('created_at', today())
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Pending->value])
            ->count();
        $ordersThisMonth = Order::whereBetween('created_at', [$thisMonth, now()])
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Pending->value])
            ->count();
        $ordersLastMonth = Order::whereBetween('created_at', [$lastMonth, now()->subMonth()->endOfMonth()])
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Pending->value])
            ->count();
        $ordersGrowth    = $ordersLastMonth > 0
            ? round((($ordersThisMonth - $ordersLastMonth) / $ordersLastMonth) * 100, 1)
            : 0;

        // By status (active - exclude cancelled)
        $byStatus = collect(OrderStatus::cases())
            ->filter(fn($s) => $s->value !== OrderStatus::Cancelled->value)
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

            // Query ORDER berdasarkan PAYMENT (konsisten dengan report)
            // Hanya hitung order yang punya payment dengan status 'paid' atau 'partial'
            $orderData = Payment::where(function ($query) {
                $query->where('payments.status', 'paid')
                    ->orWhere('payments.status', 'partial');
            })
                ->join('orders', 'payments.order_id', '=', 'orders.id')
                ->whereNotIn('orders.status', [OrderStatus::Cancelled->value])
                ->whereDate('payments.created_at', $date)
                ->select([
                    DB::raw('SUM(CASE WHEN payments.status = "paid" THEN payments.amount_paid ELSE 0 END) as revenue'),
                    DB::raw('SUM(CASE WHEN payments.status = "partial" THEN payments.amount_remaining ELSE 0 END) as pending_revenue'),
                    DB::raw('COUNT(DISTINCT payments.order_id) as orders'),
                ])
                ->first();

            return [
                'date'    => $date,
                'label'   => now()->subDays($daysAgo)->format('d M'),
                'revenue' => (float) ($orderData->revenue ?? 0),
                'pending_revenue' => (float) ($orderData->pending_revenue ?? 0),
                'orders'  => (int) ($orderData->orders ?? 0),
            ];
        });

        return response()->json(['data' => $data]);
    }

    public function topMenus(): JsonResponse
    {
        // Gunakan status yang sama dengan report: 'delivered' dan 'ready'
        $menus = OrderItem::whereBetween('created_at', [now()->subDays(30), now()])
            ->whereHas('order', fn ($q) => $q->whereIn('status', [OrderStatus::Delivered->value, OrderStatus::Ready->value])
            )
            ->select([
                'menu_id',
                DB::raw('SUM(qty) as total_qty'),
                DB::raw('SUM(subtotal) as total_revenue'),
                DB::raw('COUNT(DISTINCT order_id) as order_count'),
            ])
            ->with('menu:id,name,category,price')
            ->groupBy('menu_id')
            ->orderByDesc('total_qty')
            ->limit(8)
            ->get()
            ->map(fn ($item) => [
                'menu_id' => $item->menu_id,
                'name' => $item->menu?->name ?? 'Menu dihapus',
                'category' => $item->menu?->category ?? '-',
                'price' => (float) ($item->menu?->price ?? 0),
                'total_qty' => (int) $item->total_qty,
                'total_revenue' => (float) $item->total_revenue,
                'order_count' => (int) $item->order_count,
            ]);

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
                'order_type'   => $order->order_type->value, // Kirim enum value (dine_in, take_away, delivery)
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
