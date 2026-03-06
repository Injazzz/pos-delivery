<?php

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
        Schema::create('order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                  ->constrained('orders')
                  ->cascadeOnDelete();
            $table->string('from_status')->nullable(); // status sebelumnya
            $table->string('to_status');               // status baru
            $table->foreignId('updated_by')
                  ->constrained('users')
                  ->restrictOnDelete();
            $table->text('reason')->nullable();        // alasan perubahan (wajib untuk manager)
            $table->timestamp('updated_at');

            $table->index('order_id');
            $table->index('updated_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_status_logs');
    }
};
