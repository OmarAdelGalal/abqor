<?php

use App\Enums\CourseStatus;
use App\Enums\CoursesType;
use App\Enums\PricingPolicy;
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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');

            $table->string('pdf')->nullable();
            $table->string('video')->nullable();
            $table->json('details');
            $table->string('link')->unique();
            $table->enum('status', CourseStatus::values())->default(CourseStatus::DRAFT->value);
            //! all next field are  required on publish
            $table->foreignId('teacher_id')->nullable()->constrained('users')->cascadeOnDelete();
            $table->foreignId('subject_id')->nullable()->constrained()->cascadeOnDelete();        
            $table->string('image')->nullable();
            $table->integer('lessons_count')->nullable();
            $table->integer('solves_count')->nullable();
            $table->string('time')->nullable();
            $table->json('target')->nullable();
            $table->string('hours')->nullable();
            $table->enum('type',CoursesType::values());
            $table->enum('pricing_policy',PricingPolicy::values())->nullable();
            $table->integer('price')->nullable();
            $table->string('color')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
