<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('idempotency_key')->nullable()->unique();
            $table->string('email');
            $table->string('customer_name');
            $table->string('phone')->nullable();
            $table->string('status', 32)->default('pending_payment');
            $table->decimal('subtotal', 14, 3)->default(0);
            $table->decimal('total', 14, 3)->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('tap_charge_id')->nullable()->index();
            $table->string('tap_payment_url')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
