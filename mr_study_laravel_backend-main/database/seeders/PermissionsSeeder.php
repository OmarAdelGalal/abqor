<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class PermissionsSeeder extends Seeder
{

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permissions = [
            ['name' => 'كل الصلاحيات', 'ability' => 'all',],
            ['name' => 'المراحل الدراسية', 'ability' => 'education_levels'],
            ['name' => 'الكويزات', 'ability' => 'quizzes',],
            ['name' => 'بنك الاسئلة', 'ability' => 'questions_banks',],
            ['name' => 'الدورات', 'ability' => 'courses',],
            ['name' => 'تنسيق المستويات', 'ability' => 'quizzes_styles',],
            ['name' => 'المدرسين', 'ability' => 'teachers'],
            ['name' => 'الطلاب', 'ability' => 'students',],
            ['name' => 'المستخدمين', 'ability' => 'admins',],
            ['name' => 'الكتب', 'ability' => 'books',],
            ['name' => 'بقي على امتحان البكالوريا', 'ability' => 'bac',],
            ['name' => 'Study with me', 'ability' => 'study_with_me',],
            ['name' => 'الاسئلة الاكثر تداولا', 'ability' => 'help_center',],
            ['name' => 'من نحن', 'ability' => 'about_us',],
            ['name' => 'التحاليل والتقارير', 'ability' => 'statistics',],
            ['name' => 'الشروط والاحكام', 'ability' => 'terms',],
            ['name' => 'تنبيهات المستخدمين', 'ability' => 'notifications',],
            ['name' => 'الاعدادات', 'ability' => 'app_config',],
        ];


        foreach ($permissions as $permission) {
            Permission::create($permission);
        }
        $admin = User::where('isSuperAdmin', true)->first();
        if ($admin){
            $permissionAll = Permission::where('ability', 'all')->first();
            $admin->permissions()->attach($permissionAll->id);
        }
    }
}
