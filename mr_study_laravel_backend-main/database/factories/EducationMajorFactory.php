<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EducationMajor>
 */
class EducationMajorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
          
            'title'=>fake()->word(),
            'image'=>'education_majors/1.png',
            'description'=>fake()->words(3,true),
        ];
    }
}
