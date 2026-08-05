<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('quizzes_styles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('education_level_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('education_year_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('education_major_id')->nullable()->constrained()->cascadeOnDelete();
            $table->integer('term');
            $table->integer('week');
            $table->integer('day');
            $table->string('color');
            $table->string('image');
            $table->string('image_gray');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quizzes_styles');
    }
};
