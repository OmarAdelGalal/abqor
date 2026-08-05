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
            $table->string('email')->nullable();
            $table->string('follow_instagram')->nullable();
            $table->string('follow_telegram')->nullable();
            $table->integer('trying_numbers')->nullable();

            $table->string('mobile',15)->change()->nullable();
            $table->text('twitter')->change()->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_configs', function (Blueprint $table) {
            $table->dropColumn('email');
            $table->dropColumn('follow_instagram');
            $table->dropColumn('follow_telegram');
        });
    }
};
