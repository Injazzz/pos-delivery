<?php

namespace App\Services;

use App\Enums\DeliveryStatus;
use App\Enums\OrderStatus;
use App\Events\DeliveryStatusUpdated;
use App\Http\Resources\DeliveryResource;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\User;
use App\Notifications\DeliveryNotification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Intervention\Image\Laravel\Facades\Image;

class DeliveryService
{
    // ── Queries ───────────────────────────────────────────────────────────────

    public function getDeliveries(array $filters, User $auth): LengthAwarePaginator
    {
        return Delivery::query()
            ->when($auth->isKurir(), fn($q) =>
                $q->where('courier_id', $auth->id)
            )
            ->when($filters['status'] ?? null, fn($q, $v) =>
                $q->where('delivery_status', $v)
            )
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->whereHas('order', fn($oq) =>
                    $oq->where('order_code', 'like', "%{$v}%")
                )
            )
            ->with(['order.customer.user', 'order.items', 'courier'])
            ->latest()
            ->paginate($filters['per_page'] ?? 15);
    }

    public function getActiveDeliveries(User $courier): array
    {
        return Delivery::where('courier_id', $courier->id)
            ->whereIn('delivery_status', [
                DeliveryStatus::Assigned->value,
                DeliveryStatus::PickedUp->value,
                DeliveryStatus::OnWay->value,
            ])
            ->with(['order.customer.user', 'order.items'])
            ->get()
            ->map(fn($d) => (new DeliveryResource($d))->toArray(request()))
            ->toArray();
    }

    public function getSummary(): array
    {
        return [
            'pending'    => Delivery::where('delivery_status', DeliveryStatus::Pending->value)->count(),
            'assigned'   => Delivery::where('delivery_status', DeliveryStatus::Assigned->value)->count(),
            'on_way'     => Delivery::whereIn('delivery_status', [
                DeliveryStatus::PickedUp->value,
                DeliveryStatus::OnWay->value,
            ])->count(),
            'delivered'  => Delivery::where('delivery_status', DeliveryStatus::Delivered->value)->count(),
            'failed'     => Delivery::where('delivery_status', DeliveryStatus::Failed->value)->count(),
        ];
    }

    // ── Assign Courier ────────────────────────────────────────────────────────

    public function assignCourier(Delivery $delivery, int $courierId): Delivery
    {
        $courier = User::findOrFail($courierId);

        if (!$courier->isKurir()) {
            throw ValidationException::withMessages([
                'courier_id' => ['User yang dipilih bukan kurir.'],
            ]);
        }

        if (!$courier->isActive()) {
            throw ValidationException::withMessages([
                'courier_id' => ['Kurir tidak aktif.'],
            ]);
        }

        DB::transaction(function () use ($delivery, $courier) {
            $oldStatus = $delivery->delivery_status->value;

            $delivery->update([
                'courier_id'      => $courier->id,
                'delivery_status' => DeliveryStatus::Assigned->value,
            ]);

            // Update order status ke ready jika belum
            $order = $delivery->order;
            if ($order->status === OrderStatus::Processing || $order->status === OrderStatus::Cooking) {
                $order->transitionStatus(OrderStatus::Ready, Auth::user(), 'Kurir ditugaskan');
            }

            // Notif ke customer
            if ($delivery->order->customer?->user) {
                $delivery->order->customer->user->notify(
                    new DeliveryNotification($delivery, 'assigned')
                );
            }

            // Broadcast
            broadcast(new DeliveryStatusUpdated(
                $delivery->fresh()->load(['order.customer.user', 'courier']),
                $oldStatus,
                DeliveryStatus::Assigned->value
            ))->toOthers();

            activity()->causedBy(Auth::user())->performedOn($delivery)
                ->log("Assign kurir {$courier->name} ke delivery #{$delivery->id}");
        });

        return $delivery->fresh()->load(['order.customer.user', 'courier']);
    }

    // ── Update Delivery Status (Kurir) ────────────────────────────────────────

    public function updateStatus(
        Delivery $delivery,
        DeliveryStatus $newStatus,
        User $courier,
        ?string $notes = null
    ): Delivery {
        // Validasi kurir yang bertugas
        if ($delivery->courier_id !== $courier->id && !$courier->isManager()) {
            throw ValidationException::withMessages([
                'delivery' => ['Anda tidak ditugaskan untuk pengiriman ini.'],
            ]);
        }

        // Validasi transisi status
        $allowed = $delivery->delivery_status->allowedNextStatuses();
        if (!in_array($newStatus, $allowed)) {
            throw ValidationException::withMessages([
                'status' => ["Tidak dapat mengubah status dari '{$delivery->delivery_status->value}' ke '{$newStatus->value}'."],
            ]);
        }

        $oldStatus = $delivery->delivery_status->value;

        DB::transaction(function () use ($delivery, $newStatus, $courier, $notes, $oldStatus) {
            $updateData = ['delivery_status' => $newStatus->value];

            if ($newStatus === DeliveryStatus::PickedUp) {
                $updateData['picked_up_at'] = now();
            }

            if ($newStatus === DeliveryStatus::Delivered) {
                $updateData['delivered_at'] = now();
            }

            $delivery->update($updateData);

            // Sync order status
            $this->syncOrderStatus($delivery->order, $newStatus);

            // Notif customer
            if ($delivery->order->customer?->user) {
                $delivery->order->customer->user->notify(
                    new DeliveryNotification($delivery, $newStatus->value)
                );
            }

            // Broadcast
            broadcast(new DeliveryStatusUpdated(
                $delivery->fresh()->load(['order.customer.user', 'courier']),
                $oldStatus,
                $newStatus->value
            ))->toOthers();

            activity()->causedBy($courier)->performedOn($delivery)
                ->withProperties(['from' => $oldStatus, 'to' => $newStatus->value, 'notes' => $notes])
                ->log("Update status delivery: {$oldStatus} → {$newStatus->value}");
        });

        return $delivery->fresh()->load(['order.customer.user', 'courier']);
    }

    // ── Upload Proof Photo ────────────────────────────────────────────────────

    public function uploadProof(Delivery $delivery, $imageFile, User $courier): Delivery
    {
        if ($delivery->courier_id !== $courier->id && !$courier->isManager()) {
            throw ValidationException::withMessages([
                'proof' => ['Anda tidak ditugaskan untuk pengiriman ini.'],
            ]);
        }

        // Proses gambar + tambah watermark timestamp
        $image     = Image::read($imageFile);
        $timestamp = now()->format('d/m/Y H:i:s');

        // Resize jika terlalu besar
        $image->scaleDown(width: 1280);

        // Watermark: background gelap di bagian bawah
        $width  = $image->width();
        $height = $image->height();

        // Tambah strip hitam semi-transparan di bawah
        $image->drawRectangle(0, $height - 60, function($rect) use ($width, $height) {
            $rect->size($width, 60);
            $rect->background('rgba(0,0,0,0.65)');
        });

        // Tulis teks timestamp
        $image->text($timestamp, 16, $height - 36, function($font) {
            $font->size(22);
            $font->color('#FFFFFF');
        });

        $image->text("Order #{$delivery->order->order_code}", 16, $height - 14, function($font) {
            $font->size(16);
            $font->color('#FFD700');
        });

        // Simpan ke storage
        $filename = "proof_{$delivery->id}_" . time() . '.jpg';
        $path     = "deliveries/proof/{$filename}";

        Storage::disk('public')->put($path, $image->toJpeg(85));

        $delivery->update([
            'proof_image'           => $path,
            'proof_image_timestamp' => now(),
        ]);

        // Auto update status ke delivered jika belum
        if ($delivery->delivery_status === DeliveryStatus::OnWay) {
            $this->updateStatus($delivery, DeliveryStatus::Delivered, $courier, 'Foto bukti diupload');
        }

        return $delivery->fresh()->load(['order.customer.user', 'courier']);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function syncOrderStatus(Order $order, DeliveryStatus $deliveryStatus): void
    {
        $map = [
            DeliveryStatus::PickedUp->value  => OrderStatus::OnDelivery,
            DeliveryStatus::OnWay->value     => OrderStatus::OnDelivery,
            DeliveryStatus::Delivered->value => OrderStatus::Delivered,
            DeliveryStatus::Failed->value    => OrderStatus::Cancelled,
        ];

        if (isset($map[$deliveryStatus->value])) {
            $targetOrderStatus = $map[$deliveryStatus->value];
            if ($order->canTransitionTo($targetOrderStatus, Auth::user() ?? $order->cashier)) {
                $order->transitionStatus($targetOrderStatus, Auth::user() ?? $order->cashier);
            }
        }
    }
}
