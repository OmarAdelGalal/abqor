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
        Schema::create('pending_students', function (Blueprint $table) {
            $table->id();
              #personal details
              $table->string('name');
              $table->string('email');
              $table->enum('gender',['male','female'])->nullable();
              #program
              $table->foreignId('education_level_id')->constrained()->cascadeOnDelete();
              $table->foreignId('education_year_id')->constrained()->cascadeOnDelete();
              $table->foreignId('education_major_id')->nullable()->constrained()->cascadeOnDelete();

              
              $table->string('state',50);
              #identification details
              $table->string('phone',15);
              //password
              $table->string('password');
  
              $table->string('know_by');

              $table->foreignId('otp_code_id')->constrained()->cascadeOnDelete();
              $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pending_students');
    }
};
