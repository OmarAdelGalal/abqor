<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('12345678'), // password
            'phone' => fake()->phoneNumber(),

        ];
    }

    
    public function teacher()
    {
        return $this->state(function (array $attributes) {
            return [
                'role' => UserRole::TEACHER,
                'avatar'=>'avatars/1.png'
            ];
        });
    }
}
