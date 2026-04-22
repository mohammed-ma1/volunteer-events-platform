<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Cloudflare Stream iframe URL (preferred) or any direct mp4 URL
            // hosted on R2/S3/etc. Long enough to comfortably hold either.
            $table->string('recording_url', 1024)->nullable()->after('zoom_link');
        });

        // Honor-system "I finished watching" flag, one row per (user, event).
        // Required before the user can download the workshop certificate.
        Schema::create('event_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->timestamp('completed_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_completions');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('recording_url');
        });
    }
};
