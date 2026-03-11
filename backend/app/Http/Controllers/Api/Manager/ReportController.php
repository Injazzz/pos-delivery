<?php

namespace App\Http\Controllers\Api\Manager;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportController extends Controller
{
    // ── Summary ──────────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/summary?from=&to=&period=today|week|month|custom
     */
    public function summary(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);

        $orders = Order::whereBetween('created_at', [$from, $to])
            ->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Pending->value])
            ->get();

        $payments = Payment::whereBetween('created_at', [$from, $to])
            ->where('status', 'paid')
            ->get();

        // Partial payments untuk track pending revenue
        $partialPayments = Payment::whereBetween('created_at', [$from, $to])
            ->where('status', 'partial')
            ->get();

        // Previous period untuk growth calculation
        $diff = $from->diffInSeconds($to);
        $prevFrom = $from->copy()->subSeconds($diff + 1);
        $prevTo = $from->copy()->subSecond();

        $prevRevenue = Payment::whereBetween('created_at', [$prevFrom, $prevTo])
            ->where('status', 'paid')
            ->sum('amount_paid');

        $revenue = $payments->sum('amount_paid');
        $pendingRevenue = $partialPayments->sum('amount_remaining');
        $growthRevenue = $prevRevenue > 0
            ? round((($revenue - $prevRevenue) / $prevRevenue) * 100, 1)
            : null;

        return response()->json([
            'data' => [
                'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
                'revenue' => (float) $revenue,
                'revenue_pending' => (float) $pendingRevenue,
                'revenue_growth' => $growthRevenue,
                'orders_count' => $orders->count(),
                'orders_paid' => $payments->count(),
                'orders_partial' => $partialPayments->count(),
                'avg_order_value' => $orders->count() > 0
                    ? round($revenue / $orders->count(), 2)
                    : 0,
                'orders_by_status' => $orders
                    ->groupBy('status')
                    ->map->count()
                    ->toArray(),
                'orders_by_type' => $orders
                    ->groupBy('order_type')
                    ->map->count()
                    ->toArray(),
            ],
        ]);
    }

    // ── Revenue Chart ─────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/revenue-chart?from=&to=&group_by=day|week|month
     */
    public function revenueChart(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);
        $groupBy = $request->input('group_by', 'day');

        $format = match ($groupBy) {
            'month' => '%Y-%m',
            'week' => '%Y-%u',
            default => '%Y-%m-%d',
        };

        // Join dengan Orders untuk filter status yang konsisten dengan summary
        // Include paid + partial (untuk mencocokkan total orders di summary)
        $rows = Payment::whereBetween('payments.created_at', [$from, $to])
            ->whereIn('payments.status', ['paid', 'partial'])
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value])
            ->select([
                DB::raw("DATE_FORMAT(payments.created_at, '{$format}') as period"),
                DB::raw('SUM(CASE WHEN payments.status = "paid" THEN payments.amount_paid ELSE 0 END) as revenue'),
                DB::raw('COUNT(DISTINCT payments.order_id) as orders'),
                DB::raw('SUM(CASE WHEN payments.status = "partial" THEN payments.amount_remaining ELSE 0 END) as pending_revenue'),
            ])
            ->groupBy('period')
            ->orderBy('period')
            ->get();

        // Fill missing dates
        $filled = $this->fillMissingDates($rows->toArray(), $from, $to, $groupBy);

        return response()->json(['data' => $filled]);
    }

    // ── Top Menus ─────────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/top-menus?from=&to=&limit=10
     */
    public function topMenus(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);
        $limit = (int) $request->input('limit', 10);

        $menus = OrderItem::whereBetween('created_at', [$from, $to])
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
            ->limit($limit)
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

    // ── Category Breakdown ────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/categories?from=&to=
     */
    public function categories(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);

        $rows = OrderItem::whereBetween('order_items.created_at', [$from, $to])
            ->whereHas('order', fn ($q) => $q->whereNotIn('status', [OrderStatus::Cancelled->value, OrderStatus::Pending->value])
            )
            ->join('menus', 'order_items.menu_id', '=', 'menus.id')
            ->select([
                'menus.category',
                DB::raw('SUM(order_items.qty) as total_qty'),
                DB::raw('SUM(order_items.subtotal) as total_revenue'),
            ])
            ->groupBy('menus.category')
            ->orderByDesc('total_revenue')
            ->get();

        $totalRevenue = $rows->sum('total_revenue');

        $data = $rows->map(fn ($r) => [
            'category' => $r->category,
            'total_qty' => (int) $r->total_qty,
            'total_revenue' => (float) $r->total_revenue,
            'percentage' => $totalRevenue > 0
                ? round(($r->total_revenue / $totalRevenue) * 100, 1)
                : 0,
        ]);

        return response()->json(['data' => $data]);
    }

    // ── Payment Methods ───────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/payment-methods?from=&to=
     */
    public function paymentMethods(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);

        // Join dengan Orders untuk filter status yang konsisten
        $rows = Payment::whereBetween('payments.created_at', [$from, $to])
            ->where('payments.status', 'paid')
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->whereNotIn('orders.status', [OrderStatus::Cancelled->value])
            ->select([
                'payments.method',
                DB::raw('COUNT(*) as count'),
                DB::raw('SUM(payments.amount_paid) as total'),
            ])
            ->groupBy('payments.method')
            ->get();

        $labels = [
            'cash' => 'Tunai',
            'qris' => 'QRIS',
            'transfer' => 'Transfer',
            'midtrans' => 'Midtrans',
            'downpayment' => 'DP',
        ];

        $data = $rows->map(fn ($r) => [
            'method' => $r->method->value,
            'label' => $labels[$r->method->value] ?? $r->method->value,
            'count' => (int) $r->count,
            'total' => (float) $r->total,
        ]);

        return response()->json(['data' => $data]);
    }

    // ── Orders Table ──────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/orders?from=&to=&status=&type=&page=
     */
    public function orders(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);

        $orders = Order::whereBetween('created_at', [$from, $to])
            ->when($request->status, fn ($q, $v) => $q->where('status', $v)
            )
            ->when($request->type, fn ($q, $v) => $q->where('type', $v)
            )
            ->when($request->search, fn ($q, $v) => $q->where('order_code', 'like', "%{$v}%")
            )
            ->with(['customer.user:id,name', 'cashier:id,name', 'payment'])
            ->latest()
            ->paginate($request->input('per_page', 20))
            ->through(fn ($o) => [
                'id' => $o->id,
                'order_code' => $o->order_code,
                'type' => $o->order_type->value,
                'type_label' => match ($o->order_type->value) {
                    'dine_in' => 'Makan di Tempat',
                    'takeaway' => 'Bawa Pulang',
                    'delivery' => 'Delivery',
                    default => $o->order_type->value,
                },
                'status' => $o->status->value,
                'status_label' => $o->status->label(),
                'total' => (float) $o->total_price,
                'customer' => $o->customer?->user->name ?? 'Walk-in',
                'cashier' => $o->cashier?->name ?? '-',
                'payment_method' => $o->payment?->method?->value ?? '-',
                'payment_status' => $o->payment?->status ?? '-',
                'amount_paid' => (float) ($o->payment?->amount_paid ?? 0),
                'amount_remaining' => (float) ($o->payment?->amount_remaining ?? 0),
                'created_at' => $o->created_at->toISOString(),
            ]);

        return response()->json($orders);
    }

    // ── Export Excel ──────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/export/excel?from=&to=
     */
    public function exportExcel(Request $request)
    {
        [$from, $to] = $this->parseDateRange($request);

        $orders = Order::whereBetween('created_at', [$from, $to])
            ->with(['customer.user:id,name', 'cashier:id,name', 'payment', 'items.menu:id,name'])
            ->latest()
            ->get();

        $headers = [
            'No', 'Kode Order', 'Tanggal', 'Jenis', 'Status',
            'Customer', 'Kasir', 'Subtotal', 'Diskon', 'Total',
            'Metode Bayar', 'Bayar', 'Kembalian', 'Status Pembayaran', 'Pelunasan',
        ];

        $rows = $orders->map(function ($o, $i) {
            $paymentStatus = $o->payment?->status ?? '-';
            $pelunasan = '-';

            if ($o->payment && $o->payment->method?->value === 'downpayment' && $o->payment->status === 'partial') {
                $pelunasan = $o->payment->amount_remaining ?? 0;
            }

            return [
                $i + 1,
                $o->order_code,
                $o->created_at->format('d/m/Y H:i'),
                $o->order_type->value,
                $o->status->label(),
                $o->customer?->user->name ?? 'Walk-in',
                $o->cashier?->name ?? '-',
                $o->subtotal,
                $o->discount ?? 0,
                $o->total_price,
                $o->payment?->method?->value ?? '-',
                $o->payment?->amount_paid ?? 0,
                $o->payment?->change_amount ?? 0,
                $paymentStatus,
                $pelunasan,
            ];
        });

        // Create spreadsheet dengan formatting
        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Laporan');

        // Helper function to convert column number (0-based) to letter
        $numberToColumn = function ($num) {
            $num++;  // Convert to 1-based
            $letter = '';
            while ($num > 0) {
                $num--;
                $letter = chr($num % 26 + 65).$letter;
                $num = floor($num / 26);
            }

            return $letter;
        };

        // Set header dengan formatting
        foreach ($headers as $col => $header) {
            $colLetter = $numberToColumn($col);
            $cell = $sheet->getCell("{$colLetter}1");
            $cell->setValue($header);

            // Bold + background biru
            $cell->getStyle()->getFont()->setBold(true);
            $cell->getStyle()->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('FFFFFF'));
            $cell->getStyle()->getFill()
                ->setFillType(Fill::FILL_SOLID)
                ->getStartColor()
                ->setARGB('FF1E3A8A'); // Blue 900

            // Center alignment
            $cell->getStyle()->getAlignment()
                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                ->setVertical(Alignment::VERTICAL_CENTER);
        }

        // Set data rows
        foreach ($rows as $rowIndex => $row) {
            foreach ($row as $colIndex => $value) {
                $colLetter = $numberToColumn($colIndex);
                $cell = $sheet->getCell("{$colLetter}".($rowIndex + 2));
                $cell->setValue($value);
            }
        }

        // Auto width columns
        foreach (range(0, count($headers) - 1) as $col) {
            $colLetter = $numberToColumn($col);
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }

        // Set row height untuk header
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Create writer dan output
        $writer = new Xlsx($spreadsheet);
        $filename = "laporan_{$from->format('Ymd')}_{$to->format('Ymd')}.xlsx";

        // Write to temp file
        $tempFile = tempnam(sys_get_temp_dir(), 'xlsx');
        $writer->save($tempFile);

        // Return file sebagai response
        return response()->download($tempFile, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }

    // ── Export PDF ────────────────────────────────────────────────────────────

    /**
     * GET /api/manager/reports/export/pdf?from=&to=
     * Returns JSON data untuk dirender sebagai PDF di frontend
     */
    public function exportPdfData(Request $request): JsonResponse
    {
        [$from, $to] = $this->parseDateRange($request);

        [$summaryData] = [$this->summary($request)->getData(true)['data']];
        [$topMenusData] = [$this->topMenus($request)->getData(true)['data']];
        [$paymentData] = [$this->paymentMethods($request)->getData(true)['data']];

        return response()->json([
            'data' => [
                'period' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
                'summary' => $summaryData,
                'top_menus' => $topMenusData,
                'payment_methods' => $paymentData,
                'generated_at' => now()->toISOString(),
            ],
        ]);
    }

    /**
     * GET /api/manager/orders/{order}/receipt
     * Reprint struk untuk manager (sudah ada di Module 9)
     */
    public function receipt(Order $order): JsonResponse
    {
        $order->load(['customer.user', 'items.menu', 'payment', 'cashier']);

        $data = app(\App\Services\PaymentService::class)->getReceiptData($order);

        return response()->json(['data' => $data]);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function parseDateRange(Request $request): array
    {
        $period = $request->input('period', 'today');

        return match ($period) {
            'today' => [Carbon::today(), Carbon::today()->endOfDay()],
            'week' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()],
            'month' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()],
            'year' => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()],
            'custom' => [
                Carbon::parse($request->input('from', today()))->startOfDay(),
                Carbon::parse($request->input('to', today()))->endOfDay(),
            ],
            default => [Carbon::today(), Carbon::today()->endOfDay()],
        };
    }

    private function fillMissingDates(array $rows, Carbon $from, Carbon $to, string $groupBy): array
    {
        $map = collect($rows)->keyBy('period');
        $result = [];
        $current = $from->copy();

        while ($current->lte($to)) {
            $key = match ($groupBy) {
                'month' => $current->format('Y-m'),
                'week' => $current->format('Y-W'),
                default => $current->format('Y-m-d'),
            };

            $rowData = $map->get($key) ?? [];
            $result[] = [
                'period' => $key,
                'label' => match ($groupBy) {
                    'month' => $current->translatedFormat('M Y'),
                    'week' => 'Minggu '.$current->format('W'),
                    default => $current->translatedFormat('d M'),
                },
                'revenue' => (float) ($rowData['revenue'] ?? 0),
                'pending_revenue' => (float) ($rowData['pending_revenue'] ?? 0),
                'orders' => (int) ($rowData['orders'] ?? 0),
            ];

            match ($groupBy) {
                'month' => $current->addMonth(),
                'week' => $current->addWeek(),
                default => $current->addDay(),
            };
        }

        return $result;
    }
}
