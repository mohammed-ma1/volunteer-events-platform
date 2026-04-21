<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role', 20)->default('user')->after('password');
            $table->string('phone', 30)->nullable()->after('role');
            $table->string('avatar_url')->nullable()->after('phone');
            $table->boolean('is_active')->default(true)->after('avatar_url');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'avatar_url', 'is_active', 'last_login_at']);
        });
    }
};
