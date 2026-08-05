<?php

use App\Enums\RecordStatus;
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
        Schema::create('lecture_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lecture_id')->constrained()->cascadeOnDelete();
            $table->text('video')->nullable();
            $table->enum('status',RecordStatus::values());
            // $table->integer('duration')->comment('In minutes');
            $table->boolean('processing')->default(false);
            $table->boolean('auto_delete')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lercture_records');
    }
};
