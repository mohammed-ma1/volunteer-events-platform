<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tracks whether a checkout opted into the BITA paper-certificate add-on
 * (a +30 KD upsell available only when the buyer is also taking the
 * 100-workshop bundle). The price is captured per-order so future price
 * changes don't rewrite historical receipts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('has_bita_addon')->default(false)->after('total');
            $table->decimal('bita_addon_price', 8, 3)->default(0)->after('has_bita_addon');
            $table->index('has_bita_addon');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['has_bita_addon']);
            $table->dropColumn(['has_bita_addon', 'bita_addon_price']);
        });
    }
};
