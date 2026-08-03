<?php

namespace Database\Factories;

use App\Enums\LectureMode;
use App\Enums\LectureType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Lecture>
 */
class LectureFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'mode'=>fake()->randomElement(LectureMode::values()),
            'description' => fake()->words(4, true),
            'type' => fake()->randomElement(LectureType::values()),
            'pdf'=>'lecture_pdfs/1.pdf',
        ];
    }
}
