<?php

use App\Enums\PaymentMethod;
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
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->cascadeOnDelete();
            $table->enum('method', array_column(PaymentMethod::cases(), 'value'));
            $table->enum('status', ['pending', 'paid', 'partial', 'failed', 'refunded'])
                  ->default('pending');

            // Midtrans fields
            $table->string('midtrans_transaction_id')->nullable()->unique();
            $table->string('midtrans_order_id')->nullable()->unique();
            $table->json('midtrans_response')->nullable(); // raw response dari midtrans
            $table->string('payment_url')->nullable();     // Snap URL

            // Amount fields (support downpayment)
            $table->decimal('amount', 12, 2);              // total yang harus dibayar
            $table->decimal('amount_paid', 12, 2)->default(0); // sudah dibayar
            $table->decimal('amount_remaining', 12, 2)->default(0); // sisa

            // Cash fields
            $table->decimal('cash_received', 12, 2)->nullable(); // uang diterima
            $table->decimal('change_amount', 12, 2)->nullable();  // kembalian

            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index('status');
            $table->index('method');
            $table->index('order_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
