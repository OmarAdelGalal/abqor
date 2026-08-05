<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuestionsBank>
 */
class QuestionsBankFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'education_level_id' => 1,
            'education_year_id' => 1,
            'education_major_id'=>null,
            'subject_id'=>1,
            'name'=>fake()->words(3,true),
        ];
    }
}
