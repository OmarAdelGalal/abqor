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
        Schema::create('questions_banks', function (Blueprint $table) {
            $table->id();
            $table->string('name');
                        
            $table->foreignId('education_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('education_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('education_major_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('questions_banks');
    }
};
