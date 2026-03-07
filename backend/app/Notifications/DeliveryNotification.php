<?php

namespace App\Notifications;

use App\Models\Delivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class DeliveryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Delivery $delivery,
        public string   $status
    ) {}

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): BroadcastMessage
    {
        $messages = [
            'assigned'   => "Kurir {$this->delivery->courier?->name} ditugaskan untuk pesanan Anda.",
            'picked_up'  => 'Pesanan Anda sudah diambil oleh kurir.',
            'on_way'     => 'Kurir sedang dalam perjalanan menuju lokasi Anda.',
            'delivered'  => 'Pesanan Anda telah tiba! Mohon konfirmasi penerimaan.',
            'failed'     => 'Pengiriman gagal. Silakan hubungi kami.',
        ];

        return new BroadcastMessage([
            'title'       => 'Update Pengiriman',
            'message'     => $messages[$this->status] ?? "Status pengiriman: {$this->status}",
            'order_id'    => $this->delivery->order_id,
            'order_code'  => $this->delivery->order->order_code,
            'delivery_id' => $this->delivery->id,
            'status'      => $this->status,
        ]);
    }
}
