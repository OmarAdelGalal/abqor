<?php

use App\Enums\SelectNext;
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
        Schema::create('education_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('subtitle');
            $table->string('image');
            $table->text('description');
            $table->boolean('hide')->default(false);
            $table->enum('select_next', SelectNext::values());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('education_levels');
    }
};
