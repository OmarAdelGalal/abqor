<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('lecture_registrants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained('lectures')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('registrant_id')->nullable();
            $table->string('registrant_token')->nullable();
            $table->text('join_url')->nullable();
            $table->string('email')->nullable();
            $table->timestamps();

            $table->unique(['lecture_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lecture_registrants');
    }
};