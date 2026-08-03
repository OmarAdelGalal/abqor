<?php

namespace Database\Factories;

use App\Enums\HelpQuestionType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class HelpQuestionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title'=>fake()->words(6),
            'answer'=>'lorem ipsum dolor sit amet',
            'type'=>fake()->randomElement(HelpQuestionType::values()),
        ];
    }
}
