<?php
namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class OrderStatusNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Order  $order,
        public string $newStatus
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): BroadcastMessage
    {
        $messages = [
            'processing' => 'Pesanan Anda sedang diproses oleh kasir.',
            'cooking'    => 'Pesanan Anda sedang disiapkan di dapur.',
            'ready'      => 'Pesanan Anda siap! Segera diambil/dikirim.',
            'on_delivery'=> 'Pesanan Anda sedang dalam perjalanan.',
            'delivered'  => 'Pesanan Anda telah tiba. Selamat menikmati!',
            'cancelled'  => 'Pesanan Anda telah dibatalkan.',
        ];

        return new BroadcastMessage([
            'title'      => 'Update Pesanan #' . $this->order->order_code,
            'message'    => $messages[$this->newStatus] ?? "Status pesanan diubah ke {$this->newStatus}.",
            'order_id'   => $this->order->id,
            'order_code' => $this->order->order_code,
            'new_status' => $this->newStatus,
        ]);
    }
}
