<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Captures the coupon applied to an order and the resulting discount. Stored
 * per-order (code + amount) so the sales-per-code report and historical
 * receipts stay accurate even if a coupon is later edited or deleted.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('coupon_id')->nullable()->after('total');
            $table->string('coupon_code')->nullable()->after('coupon_id');
            $table->decimal('discount_amount', 8, 3)->default(0)->after('coupon_code');
            $table->index('coupon_code');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['coupon_code']);
            $table->dropColumn(['coupon_id', 'coupon_code', 'discount_amount']);
        });
    }
};
