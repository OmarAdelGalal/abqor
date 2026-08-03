<?php

namespace Database\Seeders;

use App\Enums\SelectNext;
use App\Models\EducationLevel;
use App\Models\EducationMajor;
use App\Models\EducationYear;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EducationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        EducationLevel::factory(2)->has(EducationYear::factory()->count(3),'years')->create([
            'select_next'=>SelectNext::years->value,
        ]);
        EducationLevel::factory(2)->has(
            EducationYear::factory()->has(EducationMajor::factory()->count(3),'majors')->count(3)        
        ,'years')->create([
            'select_next'=>SelectNext::years->value,
        ]);

        EducationLevel::factory(2)->has(
            EducationMajor::factory()->has(EducationYear::factory()->count(3),'years')->count(3)        
        ,'majors')->create([
            'select_next'=>SelectNext::majors->value,
        ]);
    }
}
