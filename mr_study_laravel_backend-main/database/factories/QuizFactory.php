<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quiz>
 */
class QuizFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'=>fake()->words(3,true),
            'education_level_id' => 1,
            'education_year_id' => 1,
            'education_major_id'=>null,
            'icon'=>fake()->randomElement([
                "natural_sciences",
                "mathematics",
                "physics",
                "arabic_language",
                "french_language",
                "english_language",
                "islamic_education",
                "history_geography",
                "philosophy",
                "accounting",
                "law",
                "economics",
                "spanish_language",
                "german_language",
                "italian_language",
                'art_education',
                'civic_education',
                
            ]),
            // 'points'=>fake()->numberBetween(1, 10),
        ];
    }
}
