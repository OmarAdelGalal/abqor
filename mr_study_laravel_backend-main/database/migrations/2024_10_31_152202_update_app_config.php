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
        Schema::table('app_configs', function (Blueprint $table) {
            $table->string('terms_link')->default('https://mrstudy.net/trems');
            $table->string('app_store')->default('https://www.apple.com/app-store/');
            $table->string('play_store')->default('https://play.google.com/store');
            $table->date('bac_exam_date_start')->default('2025-5-5');
            $table->date('bac_exam_date_end')->default('2025-6-5');
            $table->string('study_stream')->nullable();
            $table->boolean("quizzes_style_random")->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_configs', function (Blueprint $table) {
            //
        });
    }
};
