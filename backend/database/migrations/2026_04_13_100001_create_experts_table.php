<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone', 30)->nullable();
            $table->string('avatar_url', 500)->nullable();
            $table->text('bio')->nullable();
            $table->string('specialization', 60)->default('Other');
            $table->string('title')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('event_expert', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('expert_id')->constrained()->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['event_id', 'expert_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_expert');
        Schema::dropIfExists('experts');
    }
};
