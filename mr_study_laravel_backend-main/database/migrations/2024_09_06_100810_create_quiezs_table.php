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
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            


            $table->string('title');

            $table->foreignId('education_level_id')->constrained()->cascadeOnDelete();
            $table->foreignId('education_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('education_major_id')->nullable()->constrained()->cascadeOnDelete();
          
            $table->smallInteger('term');
            // $table->integer('points');
            $table->smallInteger('week');
            $table->smallInteger('day')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('recap')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('quiezs');
    }
};
