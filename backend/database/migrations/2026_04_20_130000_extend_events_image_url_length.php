<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE events MODIFY image_url TEXT NULL');

            return;
        }

        Schema::table('events', function (Blueprint $table) {
            $table->text('image_url')->nullable()->change();
        });
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement('ALTER TABLE events MODIFY image_url VARCHAR(255) NULL');

            return;
        }

        Schema::table('events', function (Blueprint $table) {
            $table->string('image_url')->nullable()->change();
        });
    }
};
