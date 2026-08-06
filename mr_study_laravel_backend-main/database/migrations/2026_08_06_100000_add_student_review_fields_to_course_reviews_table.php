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
        Schema::table('course_reviews', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->integer('rate')->nullable();
            $table->text('comment')->nullable();
            
            // Make original fields nullable so we can insert student reviews without title/file
            $table->string('title')->nullable()->change();
            $table->string('file')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('course_reviews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'rate', 'comment']);
            
            // Assuming title and file were not nullable previously
            $table->string('title')->nullable(false)->change();
            $table->string('file')->nullable(false)->change();
        });
    }
};
