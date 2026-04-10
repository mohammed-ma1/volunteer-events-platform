<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('events')->update(['currency' => 'KWD']);
    }

    public function down(): void
    {
        // No safe rollback without storing previous values.
    }
};
