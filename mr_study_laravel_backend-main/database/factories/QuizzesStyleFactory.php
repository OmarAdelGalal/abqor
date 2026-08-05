<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\QuizzesStyle>
 */
class QuizzesStyleFactory extends Factory
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
            'term'=>1,
            'week'=>1,
            'color'=>fake()->randomElement([
                '3DAFC1',
                'F4C23B',
                'A75758',
                'F47C27',
                '1A9E93',
                '80B4DB',
                'FF6060',
            ]),
            'image'=>'quizzes_style/1.gif',
            'image_gray'=>'quizzes_style/1.gif'
        ];
    }
}
