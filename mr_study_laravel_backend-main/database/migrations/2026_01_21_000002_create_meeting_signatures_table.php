<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('meeting_signatures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained('lectures')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('device_id')->nullable();
            $table->text('signature');
            $table->timestamp('expires_at')->nullable();
            $table->boolean('used')->default(false);
            $table->timestamps();

            $table->index(['lecture_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_signatures');
    }
};