<?php

use App\Enums\OrderStatus;
use App\Enums\OrderType;
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
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code', 20)->unique(); // INV-20240101-0001
            $table->foreignId('customer_id')
                  ->nullable()  // nullable untuk walk-in customer
                  ->constrained('customers')
                  ->nullOnDelete();
            $table->foreignId('cashier_id')
                  ->nullable()  // nullable jika order dari app langsung
                  ->constrained('users')
                  ->nullOnDelete();
            $table->enum('order_type', array_column(OrderType::cases(), 'value'));
            $table->enum('status', array_column(OrderStatus::cases(), 'value'))
                  ->default(OrderStatus::Pending->value);
            $table->decimal('subtotal', 12, 2)->default(0);
            $table->decimal('tax', 12, 2)->default(0);        // PPN atau service charge
            $table->decimal('delivery_fee', 12, 2)->default(0);
            $table->decimal('discount', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->text('notes')->nullable();                  // catatan order
            $table->string('table_number', 20)->nullable();     // untuk dine_in
            $table->timestamp('estimated_ready_at')->nullable(); // estimasi selesai
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('order_type');
            $table->index('created_at');
            $table->index(['cashier_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
