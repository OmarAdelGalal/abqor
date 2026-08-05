<?php

use App\Enums\CourseType;
use App\Enums\TeacherStatus;
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
        Schema::create('teachers', function (Blueprint $table) {
            $table->id();
            

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();         
          
            $table->string('pay_account_number')->nullable();
            $table->string('pay_account_name')->nullable();
            $table->string('pay_rip_number')->nullable();
            $table->string('pay_address')->nullable();


            $table->string('pay_image')->nullable();

            $table->string('youtube')->nullable();
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('telegram')->nullable();

            $table->string('image')->nullable();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->enum('gender',['male','female']);

            $table->enum('status',TeacherStatus::values())->default(TeacherStatus::DRAFT->value);


            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};
