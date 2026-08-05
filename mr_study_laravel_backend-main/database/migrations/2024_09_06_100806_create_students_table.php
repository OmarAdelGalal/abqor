<?php

use App\Enums\StudentTier;
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
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            //personal info
            $table->enum('gender',['male','female'])->nullable();
            $table->string('state',50);
            
            //points
            $table->integer('health')->default(0);
            $table->integer('diamonds')->default(0);
            $table->integer('flame')->default(0);
     
     
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            

            $table->enum('tier',StudentTier::values())->default(StudentTier::FREE->value);

            $table->string('know_by');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
