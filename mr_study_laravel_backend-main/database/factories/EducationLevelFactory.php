<?php

namespace Database\Factories;

use App\Enums\SelectNext;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EducationLevel>
 */
class EducationLevelFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'subtitle' => fake()->words(3, true),
            'description' => fake()->paragraphs(3, true),
            'image'=>'education_levels/1.png',
            'select_next'=>fake()->randomElement(SelectNext::values()),
        ];
    }
}
