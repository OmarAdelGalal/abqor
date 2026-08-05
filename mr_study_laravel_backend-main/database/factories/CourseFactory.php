<?php

namespace Database\Factories;

use App\Enums\CourseStatus;
use App\Enums\CoursesType;
use App\Enums\CourseType;
use App\Enums\PricingPolicy;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Course>
 */
class CourseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [

            'title' => fake()->words(3, true),
            'type'=>fake()->randomElement(CoursesType::values()),            
            'price' => fake()->numberBetween(1000, 10000),
            'pricing_policy'=>fake()->randomElement(PricingPolicy::values()),
            'lessons_count' => fake()->numberBetween(10,20),
            'solves_count' => fake()->numberBetween(10,20),
            'hours' => fake()->numberBetween(40,60).' ساعة',
            'time'=>'14:00 16:00',
            'link'=>fake()->slug(4),
            'color'=>'000000',
            'pdf'=>'course_pdfs/1.pdf',
            'video'=>'course_videos/1.mp4',
            'image'=>'course_images/1.png',
            'target'=>json_encode(['Mathematics', 'Physics', 'English']),
            'details'=>json_encode([
                fake()->words(3, true),
                fake()->words(3, true),
            ]),
            'status'=>CourseStatus::PUBLISHED->value,
            'subject_id'=>1
            
        ];
    }

}
