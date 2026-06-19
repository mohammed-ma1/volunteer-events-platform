<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discount coupon codes applied at checkout. Each coupon carries its own
 * percentage (default 5%), an active flag, and an optional expiry. Codes are
 * stored uppercased and matched case-insensitively.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->decimal('discount_percent', 5, 2)->default(5.00);
            $table->boolean('is_active')->default(true);
            $table->dateTime('expires_at')->nullable();
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
