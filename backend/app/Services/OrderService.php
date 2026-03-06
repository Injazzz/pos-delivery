<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Enums\OrderType;
use App\Enums\UserRole;
use App\Events\OrderCreated;
use App\Events\OrderStatusUpdated;
use App\Models\Delivery;
use App\Models\Menu;
use App\Models\Order;
use App\Models\User;
use App\Notifications\NewOrderNotification;
use App\Notifications\OrderStatusNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderService
{
    // ── Query ─────────────────────────────────────────────────────────────────

    public function getOrders(array $filters, User $auth): LengthAwarePaginator
    {
        return Order::query()
            ->when($auth->isPelanggan(), fn($q) =>
                $q->where('customer_id', $auth->customer->id)
            )
            ->when($filters['status'] ?? null, fn($q, $v) =>
                $q->where('status', $v)
            )
            ->when($filters['order_type'] ?? null, fn($q, $v) =>
                $q->where('order_type', $v)
            )
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where('order_code', 'like', "%{$v}%")
            )
            ->when($filters['date_from'] ?? null, fn($q, $v) =>
                $q->whereDate('created_at', '>=', $v)
            )
            ->when($filters['date_to'] ?? null, fn($q, $v) =>
                $q->whereDate('created_at', '<=', $v)
            )
            ->with(['customer.user', 'cashier', 'items.menu', 'payment', 'delivery.courier'])
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function getOrderDetail(Order $order): Order
    {
        return $order->load([
            'customer.user',
            'cashier',
            'items.menu.media',
            'payment',
            'delivery.courier',
            'statusLogs.updatedBy',
            'review',
        ]);
    }

    // ── Create ────────────────────────────────────────────────────────────────

    public function createOrder(array $data, User $auth): Order
    {
        return DB::transaction(function () use ($data, $auth) {

            // Tentukan customer_id
            $customerId = $this->resolveCustomerId($data, $auth);

            // Validasi & hitung items
            $itemsData = $this->resolveItems($data['items']);

            // Hitung delivery fee
            $deliveryFee = $data['order_type'] === OrderType::Delivery->value ? 15000 : 0;

            // Buat order
            $order = Order::create([
                'customer_id'  => $customerId,
                'cashier_id'   => $auth->isKasir() || $auth->isManager() ? $auth->id : null,
                'order_type'   => $data['order_type'],
                'status'       => OrderStatus::Pending->value,
                'delivery_fee' => $deliveryFee,
                'notes'        => $data['notes'] ?? null,
                'table_number' => $data['table_number'] ?? null,
            ]);

            // Buat order items
            foreach ($itemsData as $item) {
                $order->items()->create($item);

                // Kurangi stok jika ada
                $menu = Menu::find($item['menu_id']);
                $menu->decrementStock($item['qty']);
            }

            // Hitung total
            $order->load('items');
            $order->calculateTotals();

            // Buat delivery record jika delivery
            if ($data['order_type'] === OrderType::Delivery->value) {
                Delivery::create([
                    'order_id'        => $order->id,
                    'address'         => $data['delivery_address'],
                    'city'            => $data['delivery_city'] ?? null,
                    'delivery_status' => DeliveryStatus::Pending->value,
                    'delivery_fee'    => $deliveryFee,
                    'delivery_notes'  => $data['delivery_notes'] ?? null,
                ]);
            }

            // Log status awal
            $order->statusLogs()->create([
                'from_status' => null,
                'to_status'   => OrderStatus::Pending->value,
                'updated_by'  => $auth->id,
                'updated_at'  => now(),
            ]);

            // Notif ke kasir & manager
            $this->notifyStaff($order);

            // Broadcast event (WebSocket)
            broadcast(new OrderCreated($order->load('items')))->toOthers();

            // Activity log
            activity()->causedBy($auth)->performedOn($order)
                ->log("Membuat pesanan: {$order->order_code}");

            return $order->load(['customer.user', 'items.menu', 'delivery', 'payment']);
        });
    }

    // ── Update Status ─────────────────────────────────────────────────────────

    public function updateStatus(Order $order, OrderStatus $newStatus, User $auth, ?string $reason = null): Order
    {
        // Validasi transisi
        if (!$order->canTransitionTo($newStatus, $auth)) {
            throw ValidationException::withMessages([
                'status' => ["Tidak dapat mengubah status dari '{$order->status->value}' ke '{$newStatus->value}'."],
            ]);
        }

        $oldStatus = $order->status->value;

        DB::transaction(function () use ($order, $newStatus, $auth, $reason, $oldStatus) {
            $order->transitionStatus($newStatus, $auth, $reason);

            // Update delivery status jika perlu
            $this->syncDeliveryStatus($order, $newStatus);

            // Notif ke customer
            $this->notifyCustomer($order, $newStatus->value);

            // Broadcast
            broadcast(new OrderStatusUpdated($order, $oldStatus, $newStatus->value))->toOthers();

            activity()->causedBy($auth)->performedOn($order)
                ->withProperties(['from' => $oldStatus, 'to' => $newStatus->value])
                ->log("Update status pesanan {$order->order_code}: {$oldStatus} → {$newStatus->value}");
        });

        return $this->getOrderDetail($order);
    }

    // ── Customer: mark received ───────────────────────────────────────────────

    public function markReceived(Order $order, User $auth): Order
    {
        if ($order->customer?->user_id !== $auth->id) {
            throw ValidationException::withMessages([
                'order' => ['Anda tidak memiliki akses ke pesanan ini.'],
            ]);
        }

        if ($order->status !== OrderStatus::Delivered) {
            throw ValidationException::withMessages([
                'status' => ['Pesanan belum dikirim.'],
            ]);
        }

        return $this->updateStatus($order, OrderStatus::Delivered, $auth, 'Diterima oleh pelanggan');
    }

    // ── Receipt data ──────────────────────────────────────────────────────────

    public function getReceiptData(Order $order): array
    {
        $order->load(['customer.user', 'items.menu', 'payment', 'cashier']);

        return [
            'order_code'   => $order->order_code,
            'order_type'   => $order->order_type->label(),
            'cashier'      => $order->cashier?->name ?? 'Self-Order',
            'customer'     => $order->customer?->user->name ?? 'Walk-in',
            'table_number' => $order->table_number,
            'items'        => $order->items->map(fn($item) => [
                'name'     => $item->menu->name,
                'qty'      => $item->qty,
                'price'    => $item->price,
                'subtotal' => $item->subtotal,
                'note'     => $item->note,
            ])->toArray(),
            'subtotal'     => $order->subtotal,
            'tax'          => $order->tax,
            'delivery_fee' => $order->delivery_fee,
            'discount'     => $order->discount,
            'total'        => $order->total_price,
            'payment_method' => $order->payment?->method->value ?? '-',
            'paid_at'      => $order->payment?->paid_at?->format('d/m/Y H:i') ?? '-',
            'created_at'   => $order->created_at->format('d/m/Y H:i'),
        ];
    }

    public function getDashboardStats(): array
    {
        return [
            'today_orders'   => Order::today()->count(),
            'today_revenue'  => Order::today()->whereHas('payment', fn($q) => $q->where('status','paid'))->sum('total_price'),
            'pending'        => Order::where('status', OrderStatus::Pending->value)->count(),
            'processing'     => Order::whereIn('status', ['processing','cooking'])->count(),
            'ready'          => Order::where('status', OrderStatus::Ready->value)->count(),
        ];
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function resolveCustomerId(array $data, User $auth): ?int
    {
        // Kasir input customer_id manual (walk-in)
        if (($auth->isKasir() || $auth->isManager()) && isset($data['customer_id'])) {
            return $data['customer_id'];
        }
        // Customer order sendiri
        if ($auth->isPelanggan()) {
            return $auth->customer->id;
        }
        return null;
    }

    private function resolveItems(array $rawItems): array
    {
        $items = [];
        foreach ($rawItems as $raw) {
            $menu = Menu::find($raw['menu_id']);
            if (!$menu || !$menu->is_available) {
                throw ValidationException::withMessages([
                    'items' => ["Menu '{$menu?->name}' tidak tersedia."],
                ]);
            }
            if (!$menu->isInStock($raw['qty'])) {
                throw ValidationException::withMessages([
                    'items' => ["Stok '{$menu->name}' tidak mencukupi."],
                ]);
            }
            $items[] = [
                'menu_id' => $menu->id,
                'qty'     => $raw['qty'],
                'price'   => $menu->price,
                'subtotal'=> $menu->price * $raw['qty'],
                'note'    => $raw['note'] ?? null,
            ];
        }
        return $items;
    }

    private function syncDeliveryStatus(Order $order, OrderStatus $newStatus): void
    {
        if (!$order->delivery) return;

        $map = [
            OrderStatus::Ready->value      => DeliveryStatus::Assigned->value,
            OrderStatus::OnDelivery->value  => DeliveryStatus::OnWay->value,
            OrderStatus::Delivered->value   => DeliveryStatus::Delivered->value,
            OrderStatus::Cancelled->value   => DeliveryStatus::Failed->value,
        ];

        if (isset($map[$newStatus->value])) {
            $order->delivery->update(['delivery_status' => $map[$newStatus->value]]);
        }
    }

    private function notifyStaff(Order $order): void
    {
        User::active()->byRole(UserRole::Kasir)
            ->each(fn($u) => $u->notify(new NewOrderNotification($order)));

        User::active()->byRole(UserRole::Manager)
            ->each(fn($u) => $u->notify(new NewOrderNotification($order)));
    }

    private function notifyCustomer(Order $order, string $newStatus): void
    {
        if ($order->customer?->user) {
            $order->customer->user->notify(new OrderStatusNotification($order, $newStatus));
        }
    }
}
