<?php

use App\Enums\DeliveryStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->cascadeOnDelete();
            $table->foreignId('courier_id')
                  ->nullable()
                  ->constrained('users')
                  ->nullOnDelete();
            $table->text('address');
            $table->string('city', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->enum('delivery_status', array_column(DeliveryStatus::cases(), 'value'))
                  ->default(DeliveryStatus::Pending->value);
            $table->string('proof_image')->nullable(); // foto bukti pengiriman
            $table->string('proof_image_timestamp')->nullable(); // watermark timestamp
            $table->text('delivery_notes')->nullable();
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->timestamp('picked_up_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();

            $table->index('delivery_status');
            $table->index('courier_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
