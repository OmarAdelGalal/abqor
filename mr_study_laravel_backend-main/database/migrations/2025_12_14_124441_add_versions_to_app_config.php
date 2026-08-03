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
            $table->integer('android_build_number')->default(1);
            $table->integer('ios_build_number')->default(1);
            $table->string('android_version')->default('1.0.0');
            $table->string('ios_version')->default('1.0.0');
            $table->integer('windows_build_number')->default(1);
            $table->string('windows_version')->default('1.0.0');
            $table->integer('macos_build_number')->default(1);
            $table->string('macos_version')->default('1.0.0');
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
