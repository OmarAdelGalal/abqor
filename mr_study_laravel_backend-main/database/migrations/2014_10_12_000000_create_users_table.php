<?php

use App\Enums\UserRole;
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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            #personal details
            $table->string('name');
            $table->string('email')->unique();
            #identification details
            $table->string('phone',15)->nullable()->unique();
            $table->string('firebase_id')->nullable()->unique();
            $table->string('password');
            $table->string('avatar')->nullable();
            $table->enum('role',UserRole::values());
            $table->boolean('isBlocked')->default(false);
            $table->boolean('isDeleted')->default(false);
            $table->boolean('isSuperAdmin')->default(false);
            $table->text('fcmToken')->nullable();
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
