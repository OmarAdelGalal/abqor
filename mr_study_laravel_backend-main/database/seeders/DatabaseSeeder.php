<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

use App\Enums\UserRole;
use App\Models\AppConfig;
use App\Models\ChatRoom;
use App\Models\EducationLevel;
use App\Models\PagesConfig;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'phone' => env('ADMIN_PHONE'),
            'password' => Hash::make(env('ADMIN_PASSWORD')),
            'email' => 'admin@admin.com',
            'role' => UserRole::ADMIN,
            'isSuperAdmin'=>true,
        ]);

        

        AppConfig::create([
            'mobile'=>"012346578",
            'whatsapp'=>"https://mrstudy.net",
            'facebook'=>'https://mrstudy.net',
            'instagram'=>'https://mrstudy.net',
            'tiktok'=>'https://mrstudy.net',
            'youtube'=>'https://mrstudy.net',
            'twitter'=>'https://mrstudy.net',
            'telegram'=>'https://mrstudy.net',
            'trying_numbers'=>4,
            'email'=>'contact@mrstudy.net'
        ]);
        PagesConfig::create([
            'about_us_title'=>'من نحن',
            'about_us_subtitle'=>'',
            'terms_title'=>'الشروط والاحكام',
            'terms_subtitle'=>'',
        ]);
        ChatRoom::create([
            'name'=>'STUDY_ROOM',
            'description'=>'Room for study chat',
        ]);


        $this->call(PermissionsSeeder::class);

        if(env("APP_ENV")=="local"){
            $this->call(TestSeeder::class);
        }
    }
}
