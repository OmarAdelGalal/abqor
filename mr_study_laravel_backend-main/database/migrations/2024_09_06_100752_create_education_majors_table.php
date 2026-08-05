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
        Schema::create('education_majors', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('image');
            $table->boolean('hide')->default(false);
            $table->text('description');
            $table->foreignId('education_level_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('education_year_id')->nullable()->constrained()->cascadeOnDelete();
          $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_majors');
    }
};
