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
        Schema::create('pages_configs', function (Blueprint $table) {
            $table->id();
            $table->text('about_us_title');
            $table->text('about_us_subtitle');
            $table->text('terms_title');
            $table->text('terms_subtitle');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pages_configs');
    }
};
