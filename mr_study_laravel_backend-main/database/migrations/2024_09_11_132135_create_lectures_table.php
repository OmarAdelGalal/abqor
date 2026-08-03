<?php

use App\Enums\LectureMode;
use App\Enums\LectureStatus;
use App\Enums\LectureType;
use App\Models\Lecture;
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
        Schema::create('lectures', function (Blueprint $table) {
            $table->id();
            // $table->string('title');
            $table->string('description');
            $table->foreignId('lectures_group_id')->constrained()->cascadeOnDelete();
            $table->enum('type', LectureType::values());
       
            //optional 
            $table->enum('status', LectureStatus::values())->default(LectureStatus::PLANED->value);
            $table->string('pdf')->nullable();
            $table->foreignId('questions_bank_id')->nullable()->constrained()->nullOnDelete();
            
            // live details
            $table->dateTime('scheduled_at')->nullable();
            $table->dateTime('live_at')->nullable();
            $table->string('meeting_id')->nullable();
            $table->text('meeting_password')->nullable();
            $table->enum('mode',LectureMode::values());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lectures');
    }
};
